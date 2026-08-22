const fs = require("fs");
const path = require("path");

const COMMANDS_DIR = path.join(__dirname, "commands");

/**
 * Reads every command module in commands/, requiring the ones that expose a
 * `name` string and a callable `execute`. This is the one place that knows
 * how to enumerate "all the commands" - index.ts, help.js, and the docs
 * generator all use it instead of each running their own readdir+require
 * loop.
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

module.exports = { loadCommands, COMMANDS_DIR };
