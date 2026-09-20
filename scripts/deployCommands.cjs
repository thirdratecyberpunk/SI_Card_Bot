#!/usr/bin/env node
/**
 * Registers every public command in commands/ with Discord as a slash
 * command.
 *
 * The bot does this for itself on startup (see index.ts), which is what
 * keeps a deployed container in sync. This script is the manual escape
 * hatch: run `npm run commands:deploy` to push the current definitions
 * without restarting the bot, or to register them against a single guild
 * while developing.
 *
 * Global commands can take up to an hour to appear in every server; a
 * guild registration (DISCORD_GUILD_ID) shows up immediately, so that's
 * the one to use while iterating on a command's options.
 */
const dotenv = require("dotenv");
const { REST, Routes } = require("discord.js");
const { loadCommands } = require("../commandLoader.cjs");
const { buildSlashCommands } = require("../utils/slashCommands.cjs");

/**
 * The slash command definitions for every public command module.
 */
function slashCommandBody() {
  return buildSlashCommands(loadCommands().commands);
}

/**
 * Registers the commands through an already-logged-in client. Used by
 * index.ts on startup so a fresh deploy publishes its own commands.
 */
async function registerSlashCommands(client, { guildId } = {}) {
  const body = slashCommandBody();
  const scope = guildId ?? process.env.DISCORD_GUILD_ID;
  await client.application.commands.set(body, scope || undefined);
  return body;
}

async function main() {
  dotenv.config();

  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !clientId) {
    console.error(
      "Set DISCORD_TOKEN and DISCORD_CLIENT_ID (the bot's application ID) before running this.",
    );
    process.exit(1);
  }

  const body = slashCommandBody();
  const route = guildId
    ? Routes.applicationGuildCommands(clientId, guildId)
    : Routes.applicationCommands(clientId);

  await new REST().setToken(token).put(route, { body });
  console.log(
    `Registered ${body.length} slash command(s) ${guildId ? `to guild ${guildId}` : "globally"}.`,
  );
}

module.exports = { slashCommandBody, registerSlashCommands };

if (require.main === module) {
  main().catch((error) => {
    console.error("Failed to register slash commands:", error);
    process.exit(1);
  });
}
