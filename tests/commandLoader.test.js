// index.ts, help.js, and the docs generator all use this same loader to
// enumerate commands, so this test exercises the real implementation
// (../commandLoader.js) rather than a hand-maintained copy of it.
const { loadCommands } = require("../commandLoader.cjs");

describe("command loader (used by index.ts, help.js, and the docs generator)", () => {
  const { commandFiles, commands, namesByFile, skippedFiles } = loadCommands();

  it("finds command files in commands/", () => {
    expect(commandFiles.length).toBeGreaterThan(0);
  });

  it("requires every command file without throwing and registers a name + execute()", () => {
    // Getting this far already proves every require() succeeded; also assert
    // the loader actually picked some of them up as real commands.
    expect(commands.size).toBeGreaterThan(0);
    for (const [name, command] of commands) {
      expect(typeof name).toBe("string");
      expect(name.length).toBeGreaterThan(0);
      expect(typeof command.execute).toBe("function");
    }
  });

  it("registers every command documented in -help", () => {
    const documented = [
      "search",
      "draw",
      "dtnw",
      "take",
      "power",
      "minor",
      "major",
      "unique",
      "uniques",
      "blight",
      "board",
      "card",
      "choose",
      "event",
      "fear",
      "faq",
      "adversary",
      "adversaryrules",
      "random",
      "reactionrole",
      "spirit",
      "aspect",
      "aspects",
      "healing",
      "incarna",
      "scenario",
      "invaderdeck",
      "progression",
      "feardeck",
      "help",
    ];
    for (const name of documented) {
      expect(commands.has(name)).toBe(true);
    }
  });

  it("gives every command a unique name (no file silently shadows another)", () => {
    const filesByName = new Map();
    for (const [file, name] of namesByFile) {
      if (!filesByName.has(name)) filesByName.set(name, []);
      filesByName.get(name).push(file);
    }
    const collisions = [...filesByName.entries()].filter(
      ([, files]) => files.length > 1,
    );
    expect(collisions).toEqual([]);
  });

  it("only skips files that are genuinely data/helper modules, not commands", () => {
    // These files are require()'d by command modules for data or shared
    // logic; they intentionally have no top-level `name` + `execute` and
    // are never dispatched to directly by index.ts.
    const expectedNonCommandFiles = [
      "AdversaryNames.js",
      "boardNames.js",
      "complexities.js",
      "Deck.js",
      "fearCardText.js",
      "ImageNames.js",
      "InvaderDeckCard.js",
      "healingNames.js",
      "incarnaNames.js",
      "scenarioNames.js",
      "sendCardLink.js",
      "spiritNames.js",
    ];
    expect(skippedFiles.sort()).toEqual(expectedNonCommandFiles.sort());
  });
});
