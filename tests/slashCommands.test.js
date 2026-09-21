/**
 * Tests for the slash command layer: the definitions the bot registers
 * with Discord, and the translation back from a user's filled-in options
 * to the positional `args` array the command modules parse.
 *
 * The definition tests run against every command the loader finds rather
 * than a hand-written list, so a new command with a malformed option is
 * caught here instead of by Discord rejecting the whole registration at
 * startup (which fails all-or-nothing, taking the other 30 commands with
 * it).
 */
const { loadCommands } = require("../commandLoader.cjs");
const {
  buildSlashCommand,
  buildSlashCommands,
  argsFromInteraction,
  formatUsage,
  MAX_DESCRIPTION_LENGTH,
} = require("../utils/slashCommands.cjs");
const { createMockInteraction } = require("./helpers/discordMocks");

const { commands } = loadCommands();
const publicCommands = [...commands.values()].filter(
  (command) => command.public !== false,
);

// https://discord.com/developers/docs/interactions/application-commands
const VALID_NAME = /^[-_a-z0-9]{1,32}$/;
const MAX_CHOICES = 25;
const MAX_OPTIONS = 25;

describe("slash command definitions", () => {
  it("builds one definition per public command and leaves the rest out", () => {
    const built = buildSlashCommands(commands);
    expect(built.map((command) => command.name).sort()).toEqual(
      publicCommands.map((command) => command.name).sort(),
    );
    // roleAdd.js's `template` is public: false and shouldn't be registered.
    expect(built.map((command) => command.name)).not.toContain("template");
  });

  it.each(publicCommands.map((command) => [command.name, command]))(
    "/%s builds a definition Discord will accept",
    (name, command) => {
      const json = buildSlashCommand(command);

      expect(json.name).toMatch(VALID_NAME);
      expect(json.description.length).toBeGreaterThan(0);
      expect(json.description.length).toBeLessThanOrEqual(
        MAX_DESCRIPTION_LENGTH,
      );
      expect((json.options || []).length).toBeLessThanOrEqual(MAX_OPTIONS);

      const optionGroups = command.subcommands
        ? json.options.map((sub) => sub.options || [])
        : [json.options || []];

      for (const sub of command.subcommands ? json.options : []) {
        expect(sub.name).toMatch(VALID_NAME);
        expect(sub.description.length).toBeGreaterThan(0);
      }

      for (const options of optionGroups) {
        for (const option of options) {
          expect(option.name).toMatch(VALID_NAME);
          expect(option.description.length).toBeGreaterThan(0);
          expect(option.description.length).toBeLessThanOrEqual(
            MAX_DESCRIPTION_LENGTH,
          );
          expect(typeof option.type).toBe("number");
          if (option.choices) {
            expect(option.choices.length).toBeLessThanOrEqual(MAX_CHOICES);
            for (const choice of option.choices) {
              expect(choice.name.length).toBeGreaterThan(0);
              expect(choice.value).toBeDefined();
            }
          }
        }

        // Discord rejects a command that lists a required option after an
        // optional one.
        const required = options.map((option) => option.required);
        expect(required).toEqual([...required].sort((a, b) => b - a));
      }
    },
  );

  it("gives every spoilerable command a spoiler toggle, and nobody else one", () => {
    const withSpoiler = buildSlashCommands(commands)
      .filter((command) =>
        (command.options || []).some((option) => option.name === "spoiler"),
      )
      .map((command) => command.name);

    expect(withSpoiler.sort()).toEqual(["event", "fear", "search"]);
  });

  it("maps /random's modes onto subcommands", () => {
    const json = buildSlashCommand(commands.get("random"));
    expect(json.options.map((sub) => sub.name)).toEqual([
      "spirit",
      "adversary",
      "double",
      "scenario",
      "board",
    ]);
  });
});

describe("formatUsage", () => {
  it("marks required options with <> and optional ones with []", () => {
    expect(formatUsage(commands.get("adversaryrules"))).toBe(
      "/adversaryrules <leading> <leading_level> [supporting] [supporting_level] [nosetup]",
    );
  });

  it("gives a subcommand-based command one line per subcommand", () => {
    expect(formatUsage(commands.get("random")).split("\n")).toEqual([
      "/random spirit [max_complexity]",
      "/random adversary [min_difficulty] [max_difficulty]",
      "/random double [min_difficulty] [max_difficulty]",
      "/random scenario",
      "/random board [type]",
    ]);
  });

  it("is just the command name when it takes no options", () => {
    expect(formatUsage(commands.get("reactionrole"))).toBe("/reactionrole");
  });
});

describe("argsFromInteraction", () => {
  const argsFor = (name, options, subcommand = null) =>
    argsFromInteraction(
      createMockInteraction({ commandName: name, options, subcommand }),
      commands.get(name),
    );

  it("passes a multi-word option through as a single arg", () => {
    expect(argsFor("power", { card: "Fields Choked with Growth" })).toEqual([
      "Fields Choked with Growth",
    ]);
  });

  it("keeps declared order so positional parsers still work", () => {
    expect(
      argsFor("invaderdeck", {
        leading: "prussia",
        leading_level: 4,
        supporting: "england",
        supporting_level: 2,
      }),
    ).toEqual(["prussia", "4", "england", "2"]);
  });

  it("drops options left blank at the end of the list", () => {
    expect(
      argsFor("invaderdeck", { leading: "prussia", leading_level: 4 }),
    ).toEqual(["prussia", "4"]);
  });

  it("holds the place of an option skipped in the middle of the list", () => {
    // Without the placeholder, a max with no min would be read as a min.
    expect(argsFor("random", { max_difficulty: 5 }, "adversary")).toEqual([
      "adversary",
      "",
      "5",
    ]);
  });

  it("appends a set boolean as a flag word and omits an unset one", () => {
    expect(
      argsFor("adversaryrules", {
        leading: "prussia",
        leading_level: 4,
        nosetup: true,
      }),
    ).toEqual(["prussia", "4", "nosetup"]);

    expect(
      argsFor("adversaryrules", {
        leading: "prussia",
        leading_level: 4,
        nosetup: false,
      }),
    ).toEqual(["prussia", "4"]);
  });

  it("puts the subcommand name in args[0], where /random used to read it", () => {
    expect(argsFor("random", { type: "thematic" }, "board")).toEqual([
      "board",
      "thematic",
    ]);
    expect(argsFor("random", {}, "scenario")).toEqual(["scenario"]);
  });

  it("keeps the spoiler toggle out of args - it's the middleware's, not the command's", () => {
    expect(
      argsFor("event", { card: "promising venture", spoiler: true }),
    ).toEqual(["promising venture"]);
  });

  it("returns no args when nothing was filled in", () => {
    expect(argsFor("spirit", {})).toEqual([]);
  });
});
