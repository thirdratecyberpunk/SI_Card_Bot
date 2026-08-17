const fs = require("fs");
const path = require("path");

const COMMANDS_DIR = path.join(__dirname, "..", "commands");

/**
 * Mirrors index.ts's dynamic command-loading loop exactly: read every file
 * in commands/ ending in .js or .ts, require it, and register it if it
 * exposes a `name` string and a callable `execute`. This is the loader the
 * TypeScript migration changed (index.js -> index.ts, require() via
 * createRequire), so it's the most direct regression check for "did the
 * migration still wire every command up correctly".
 */
function loadCommands() {
  const commandFiles = fs
    .readdirSync(COMMANDS_DIR)
    .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

  const commands = new Map();
  const namesByFile = new Map();
  const skippedFiles = [];

  for (const file of commandFiles) {
    const command = require(path.join(COMMANDS_DIR, file));
    if (!command?.name || typeof command.execute !== "function") {
      skippedFiles.push(file);
      continue;
    }
    commands.set(command.name, command);
    namesByFile.set(file, command.name);
  }

  return { commandFiles, commands, namesByFile, skippedFiles };
}

describe("command loader (mirrors index.ts's dynamic require loop)", () => {
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
      "event",
      "fear",
      "faq",
      "adversary",
      "adversaryrules",
      "random",
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
