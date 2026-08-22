/**
 * Smoke/regression tests for every commands/*.js module, run the same way
 * index.ts dispatches them: command.execute(msg, args, Discord). Goal is to
 * catch anything the TS migration (index.js -> index.ts, createRequire-based
 * loading) could plausibly break: a command that throws on load, a command
 * whose output shape changed, or one that stops calling msg.channel.send.
 *
 * Expected values below were captured by actually running each command
 * against the real data files (spiritNames.js, AdversaryNames.js, etc.) as
 * of this commit — this is the regression baseline, not a spec, so update
 * the expectations here if a future change intentionally alters output.
 */
// commands/ has its own (stray, duplicate) node_modules, so a plain
// jest.mock("@sapphire/discord.js-utilities", ...) mocks the copy resolved
// from tests/ while spirit.js/aspects.js resolve the copy nested under
// commands/node_modules/ — resolve from the same place they do so the mock
// actually intercepts what they require.
jest.mock(
  require.resolve("@sapphire/discord.js-utilities", {
    paths: [require("path").join(__dirname, "..", "commands")],
  }),
  () => require("./helpers/discordMocks").paginatedMessageMock(),
);

const { createMockMessage } = require("./helpers/discordMocks");

const globals = require("../globals.cjs");

const adversary = require("../commands/adversary.js");
const adversaryRules = require("../commands/adversaryRules.js");
const aspect = require("../commands/aspect.js");
const aspects = require("../commands/aspects.js");
const blight = require("../commands/blight.js");
const board = require("../commands/board.js");
const card = require("../commands/card.js");
const choose = require("../commands/choose.js");
const days = require("../commands/days.js");
const deckCalc = require("../commands/deckCalc.js");
const draw = require("../commands/draw.js");
const event = require("../commands/event.js");
const faq = require("../commands/faq.js");
const fear = require("../commands/fear.js");
const fearDeck = require("../commands/fearDeck.js");
const healing = require("../commands/healing.js");
const help = require("../commands/help.js");
const incarna = require("../commands/incarna.js");
const major = require("../commands/major.js");
const minor = require("../commands/minor.js");
const power = require("../commands/power.js");
const powerProgression = require("../commands/powerProgression.js");
const random = require("../commands/random.js");
const role = require("../commands/role.js");
const roleAdd = require("../commands/roleAdd.js");
const scenario = require("../commands/scenario.js");
const search = require("../commands/search.js");
const spirit = require("../commands/spirit.js");
const take = require("../commands/take.js");
const unique = require("../commands/unique.js");
const uniques = require("../commands/uniques.js");

// A spirit with both aspects and uniques, but no powerProgression, so it
// exercises both the "found" and "field absent" branches across commands.
const TEST_SPIRIT_ARGS = ["A", "Spread", "of", "Rampant", "Green"];

describe("adversary", () => {
  it("returns the panel for a known adversary", async () => {
    const msg = createMockMessage();
    await adversary.execute(msg, ["prussia"]);
    expect(msg.channel.send).toHaveBeenCalledWith("https://imgur.com/KdyfP3C");
  });

  it("lists all adversaries when given no args", async () => {
    const msg = createMockMessage();
    await adversary.execute(msg, []);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("Choose an adversary:"),
    );
  });
});

describe("adversaryrules", () => {
  it("renders a PNG card for a single adversary/level", async () => {
    const msg = createMockMessage();
    await adversaryRules.execute(msg, ["prussia", "0"]);
    expect(msg.reply).toHaveBeenCalledTimes(1);
    const arg = msg.reply.mock.calls[0][0];
    expect(Array.isArray(arg.files)).toBe(true);
    expect(Buffer.isBuffer(arg.files[0].attachment)).toBe(true);
    expect(arg.files[0].attachment.length).toBeGreaterThan(0);
  });

  it("renders a PNG card for a double adversary setup", async () => {
    const msg = createMockMessage();
    await adversaryRules.execute(msg, ["prussia", "0", "england", "0"]);
    const arg = msg.reply.mock.calls[0][0];
    expect(Buffer.isBuffer(arg.files[0].attachment)).toBe(true);
  });

  it("replies with an error for an unknown adversary instead of throwing", async () => {
    const msg = createMockMessage();
    await adversaryRules.execute(msg, ["bogus", "0"]);
    expect(msg.reply).toHaveBeenCalledWith(
      expect.stringContaining("Leading adversary not found"),
    );
  });
});

describe("aspect", () => {
  it("returns the panel for an aspect name", async () => {
    const msg = createMockMessage();
    await aspect.execute(msg, ["Regrowth"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      "https://i.imgur.com/jQWp7vu.png",
    );
  });

  it("shows usage when given no args", async () => {
    const msg = createMockMessage();
    await aspect.execute(msg, []);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("Usage: aspect"),
    );
  });
});

describe("aspects", () => {
  it("lists a spirit's aspects", async () => {
    const msg = createMockMessage();
    await aspects.execute(msg, TEST_SPIRIT_ARGS);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("has the following aspects"),
    );
  });

  it("sends a paginated list when given no args", async () => {
    const msg = createMockMessage();
    await aspects.execute(msg, []);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringMatching(/^__paginated__ pages=\d+$/),
    );
  });
});

describe("blight", () => {
  it("returns a card link for an exact name", async () => {
    const msg = createMockMessage();
    await blight.execute(msg, ["downward_spiral"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      "https://sick.oberien.de/imgs/blights/downward_spiral.webp",
    );
  });
});

describe("board", () => {
  it("returns the image for a board letter", async () => {
    const msg = createMockMessage();
    await board.execute(msg, ["a"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      "https://spiritislandwiki.com/images/e/e2/Piece_core_board_a.png",
    );
  });

  it("shows help text when given no args", async () => {
    const msg = createMockMessage();
    await board.execute(msg, [""]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("Type the board name"),
    );
  });
});

describe("card (delegates to power)", () => {
  it("returns a card link for an exact name", async () => {
    const msg = createMockMessage();
    await card.execute(msg, ["fields_choked_with_growth"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      "https://sick.oberien.de/imgs/powers/fields_choked_with_growth.webp",
    );
  });
});

describe("choose", () => {
  afterEach(() => {
    globals.choices = [];
  });

  it("sends the value at the chosen index", async () => {
    globals.choices = [
      { label: "opt1", value: "chosen value 1" },
      { label: "opt2", value: "chosen value 2" },
    ];
    const msg = createMockMessage();
    await choose.execute(msg, ["1"]);
    expect(msg.channel.send).toHaveBeenCalledWith("chosen value 1");
  });

  it("rejects an out-of-range index", async () => {
    globals.choices = [{ label: "opt1", value: "chosen value 1" }];
    const msg = createMockMessage();
    await choose.execute(msg, ["9"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("invalid option"),
    );
  });

  it("tells the user to be prompted first when there are no prior choices", async () => {
    const msg = createMockMessage();
    await choose.execute(msg, ["1"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      "Please use this command after being prompted by the bot.",
    );
  });
});

describe("dtnw (days.js)", () => {
  it("returns majors and minors", async () => {
    const msg = createMockMessage();
    await days.execute(msg, []);
    const sent = msg.channel.send.mock.calls[0][0];
    expect(sent).toEqual(expect.stringContaining("Majors:"));
    expect(sent).toEqual(expect.stringContaining("Minors:"));
  });
});

describe("invaderdeck (deckCalc.js)", () => {
  it("computes a single-adversary invader deck", async () => {
    const msg = createMockMessage();
    await deckCalc.execute(msg, ["prussia", "0"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("invader deck is:"),
    );
  });

  it("computes a double-adversary invader deck", async () => {
    const msg = createMockMessage();
    await deckCalc.execute(msg, ["prussia", "0", "england", "0"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("invader deck is:"),
    );
  });

  it("reports an error for a bad adversary instead of throwing", async () => {
    const msg = createMockMessage();
    await deckCalc.execute(msg, ["bogus", "0"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("not found"),
    );
  });
});

describe("draw", () => {
  it("draws multiple cards as a bulleted list", async () => {
    const msg = createMockMessage();
    await draw.execute(msg, ["minor"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("* "),
    );
  });

  it("draws a single card as a bare string", async () => {
    const msg = createMockMessage();
    await draw.execute(msg, ["minor", "1"]);
    const sent = msg.channel.send.mock.calls[0][0];
    expect(typeof sent).toBe("string");
    expect(sent).not.toMatch(/^\s*\*/);
  });

  it("reports an error for an unknown card type instead of throwing", async () => {
    const msg = createMockMessage();
    await draw.execute(msg, ["bogus"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("specify a type of card"),
    );
  });
});

describe("event", () => {
  it("returns a card link for an exact name", async () => {
    const msg = createMockMessage();
    await event.execute(msg, ["slave_rebellion"]);
    expect(msg.channel.send.mock.calls[0][0]).toBe(
      "https://sick.oberien.de/imgs/events/slave_rebellion.webp",
    );
  });
});

describe("faq", () => {
  it("returns the default FAQ link with no args", async () => {
    const msg = createMockMessage();
    await faq.execute(msg, []);
    expect(msg.channel.send).toHaveBeenCalledWith(
      "https://querki.net/u/darker/spirit-island-faq/#!.3y28a87",
    );
  });

  it("builds a search URL from args", async () => {
    const msg = createMockMessage();
    await faq.execute(msg, ["gather", "dahan"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining(
        "https://querki.net/u/darker/spirit-island-faq/#!Search-Results",
      ),
    );
  });
});

describe("fear", () => {
  it("returns a card link for an exact name", async () => {
    const msg = createMockMessage();
    await fear.execute(msg, ["fear_of_the_unseen"]);
    expect(msg.channel.send.mock.calls[0][0]).toBe(
      "https://sick.oberien.de/imgs/fears/fear_of_the_unseen.webp",
    );
  });
});

describe("feardeck (fearDeck.js)", () => {
  it("computes a fear deck for a single adversary", async () => {
    const msg = createMockMessage();
    await fearDeck.execute(msg, ["prussia", "0"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("fear deck is"),
    );
  });
});

describe("healing", () => {
  it("returns the front panel for a healing card by title", async () => {
    const msg = createMockMessage();
    await healing.execute(msg, ["roiling"]);
    expect(msg.channel.send).toHaveBeenCalledWith("https://imgur.com/sGO0Rur");
  });
});

describe("help", () => {
  it("lists the available commands", async () => {
    const msg = createMockMessage();
    await help.execute(msg, []);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("-search"),
    );
  });

  it("omits commands explicitly marked non-public", async () => {
    const msg = createMockMessage();
    await help.execute(msg, []);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.not.stringContaining("-template"),
    );
  });

  it("gives a specific command's usage and details", async () => {
    const msg = createMockMessage();
    await help.execute(msg, ["board"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("-board [board letter/name]"),
    );
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("Returns the map image for a board"),
    );
  });

  it("reports an unknown command instead of throwing", async () => {
    const msg = createMockMessage();
    await help.execute(msg, ["zzz_no_such_command_zzz"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("No command called"),
    );
  });
});

describe("incarna", () => {
  it("returns the front panel for an incarna by name", async () => {
    const msg = createMockMessage();
    await incarna.execute(msg, ["Towering"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      "https://spiritislandwiki.com/images/f/f2/Towering_Roots_of_the_Jungle_Incarna.png",
    );
  });
});

describe("major", () => {
  it("returns a card link for an exact name", async () => {
    const msg = createMockMessage();
    await major.execute(msg, ["the_trees_and_stones_speak_of_war"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      "https://sick.oberien.de/imgs/powers/the_trees_and_stones_speak_of_war.webp",
    );
  });
});

describe("minor", () => {
  it("returns a card link for an exact name", async () => {
    const msg = createMockMessage();
    await minor.execute(msg, ["savage_mawbeasts"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      "https://sick.oberien.de/imgs/powers/savage_mawbeasts.webp",
    );
  });
});

describe("power", () => {
  it("returns a card link for an exact name", async () => {
    const msg = createMockMessage();
    await power.execute(msg, ["fields_choked_with_growth"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      "https://sick.oberien.de/imgs/powers/fields_choked_with_growth.webp",
    );
  });
});

describe("progression (powerProgression.js)", () => {
  it("reports when a spirit has no power progression", async () => {
    const msg = createMockMessage();
    await powerProgression.execute(msg, TEST_SPIRIT_ARGS);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("does not have a power progression"),
    );
  });
});

describe("random", () => {
  it("random spirit sends a name and emote", async () => {
    const msg = createMockMessage();
    await random.execute(msg, ["spirit"]);
    expect(msg.channel.send).toHaveBeenCalledTimes(2);
  });

  it("random adversary sends a name/difficulty and emote", async () => {
    const msg = createMockMessage();
    await random.execute(msg, ["adversary"]);
    expect(msg.channel.send).toHaveBeenCalledTimes(2);
    expect(msg.channel.send.mock.calls[0][0]).toEqual(
      expect.stringContaining("difficulty"),
    );
  });

  it("random double sends a leading/supporting writeup", async () => {
    const msg = createMockMessage();
    await random.execute(msg, ["double"]);
    expect(msg.channel.send.mock.calls[0][0]).toEqual(
      expect.stringContaining("LEADING"),
    );
    expect(msg.channel.send.mock.calls[0][0]).toEqual(
      expect.stringContaining("SUPPORTING"),
    );
  });

  it("random scenario sends a name and link", async () => {
    const msg = createMockMessage();
    await random.execute(msg, ["scenario"]);
    expect(msg.channel.send).toHaveBeenCalledTimes(2);
  });

  it("random board sends a letter and link", async () => {
    const msg = createMockMessage();
    await random.execute(msg, ["board"]);
    expect(msg.channel.send).toHaveBeenCalledTimes(2);
  });

  it("prompts for a sub-command when given no args", async () => {
    const msg = createMockMessage();
    await random.execute(msg, []);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("Do you want a random"),
    );
  });
});

describe("reactionrole (role.js)", () => {
  it("no-ops when the message isn't in the configured landing channel", async () => {
    const msg = createMockMessage({ channelId: "some-other-channel" });
    await role.execute(msg, [], require("discord.js"));
    expect(msg.channel.send).not.toHaveBeenCalled();
  });
});

describe("template (roleAdd.js)", () => {
  it("sends its placeholder output", async () => {
    const msg = createMockMessage();
    await roleAdd.execute(msg, []);
    expect(msg.channel.send).toHaveBeenCalledWith("output of command");
  });
});

describe("scenario", () => {
  it("returns the back panel for a scenario by name (default side)", async () => {
    const msg = createMockMessage();
    await scenario.execute(msg, ["Blitz"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      "https://i.imgur.com/rbm2vox",
    );
  });

  it("lists all scenarios when given no args", async () => {
    const msg = createMockMessage();
    await scenario.execute(msg, []);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("Scenarios are:"),
    );
  });
});

describe("search", () => {
  it("shows help text", async () => {
    const msg = createMockMessage();
    await search.execute(msg, ["help"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("Examples:"),
    );
  });

  it("builds a search URL from args", async () => {
    const msg = createMockMessage();
    await search.execute(msg, ["gather", "dahan"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      "https://sick.oberien.de/?query=gather%20dahan",
    );
  });
});

describe("spirit", () => {
  it("returns the front panel for an exact spirit match", async () => {
    const msg = createMockMessage();
    await spirit.execute(msg, TEST_SPIRIT_ARGS);
    expect(msg.channel.send).toHaveBeenCalledWith("https://imgur.com/nlpGjjH");
  });

  it("sends a paginated list when given no args", async () => {
    const msg = createMockMessage();
    await spirit.execute(msg, []);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringMatching(/^__paginated__ pages=\d+$/),
    );
  });

  it("reports an error for a search matching nothing", async () => {
    const msg = createMockMessage();
    await spirit.execute(msg, ["zzz_no_such_spirit_zzz"]);
    expect(msg.channel.send).toHaveBeenCalled();
  });
});

describe("take", () => {
  it("returns a single card link for a valid type", async () => {
    const msg = createMockMessage();
    await take.execute(msg, ["minor"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringMatching(
        /^https:\/\/sick\.oberien\.de\/imgs\/powers\/.+\.webp$/,
      ),
    );
  });

  it("reports an error when given no args instead of throwing", async () => {
    const msg = createMockMessage();
    await take.execute(msg, []);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("specify a type of card"),
    );
  });
});

describe("unique", () => {
  it("returns a card link for an exact name", async () => {
    const msg = createMockMessage();
    await unique.execute(msg, ["fields_choked_with_growth"]);
    expect(msg.channel.send).toHaveBeenCalledWith(
      "https://sick.oberien.de/imgs/powers/fields_choked_with_growth.webp",
    );
  });
});

describe("uniques", () => {
  it("lists a spirit's uniques", async () => {
    const msg = createMockMessage();
    await uniques.execute(msg, TEST_SPIRIT_ARGS);
    expect(msg.channel.send).toHaveBeenCalledWith(
      expect.stringContaining("has the following uniques"),
    );
  });
});
