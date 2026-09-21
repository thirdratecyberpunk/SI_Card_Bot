/* Loads all associated commands and exposes health endpoint
 */

import dotenv from "dotenv";
import { createRequire } from "module";
import {
  Client,
  Collection,
  GatewayIntentBits,
  ActivityType,
  MessageFlags,
} from "discord.js";
import * as Discord from "discord.js";
import express from "express";

dotenv.config();

// TODO-ts-migration remove this once everything uses `import`
const require = createRequire(import.meta.url);

// Slash commands arrive as interactions over the gateway, so none of the
// message-reading intents are needed any more - including MessageContent,
// which is privileged and had to be granted in the developer portal.
// Guilds alone covers the guild/channel/emoji caches the changelog
// broadcast and /reactionrole read.
const bot = new Client({
  intents: [GatewayIntentBits.Guilds],
});

let ready = false; // readiness flag

// --- health server ---
const app = express();
const HEALTH_PORT = parseInt(process.env.HEALTH_PORT || "3000", 10);

app.get("/healthz", (_req: any, res: any) => {
  // basic liveness: process up
  res.status(200).send("ok");
});

app.get("/ready", (_req: any, res: any) => {
  // readiness: bot connected and ready to serve
  if (ready) return res.status(200).send("ready");
  return res.status(503).send("not ready");
});

// --- deploy webhook ---
// Called by the deploy pipeline (from inside this container - see
// scripts/notifyDeploy.cjs) after a new image is up, so the bot can post
// the list of changes to every server it's in. Not reachable from outside
// the container's own network namespace (see docker-compose.yml), so the
// shared secret is defence in depth rather than the only guard.
app.use(express.json({ limit: "100kb" }));

const DEPLOY_WEBHOOK_SECRET = process.env.DEPLOY_WEBHOOK_SECRET;

app.post("/webhook/deploy", async (req: any, res: any) => {
  if (!DEPLOY_WEBHOOK_SECRET) {
    console.error(
      "DEPLOY_WEBHOOK_SECRET not configured; rejecting /webhook/deploy call",
    );
    return res.status(503).send("webhook not configured");
  }
  if (req.get("x-deploy-secret") !== DEPLOY_WEBHOOK_SECRET) {
    return res.status(401).send("unauthorized");
  }
  if (!ready) {
    return res.status(503).send("bot not ready");
  }

  const changes = Array.isArray(req.body?.changes)
    ? req.body.changes.filter(
        (change: unknown) => typeof change === "string" && change.trim(),
      )
    : [];
  if (changes.length === 0) {
    return res.status(400).send("no changes provided");
  }

  const message = formatChangelogMessage(changes);
  const result = await broadcastToGuilds(bot, message);
  console.log(
    `Changelog broadcast: sent to ${result.sent} guild(s), skipped ${result.skipped}`,
  );
  res.status(200).json(result);
});
// --- end deploy webhook ---

app.listen(HEALTH_PORT, () => {
  console.log(`Health endpoints listening on port ${HEALTH_PORT}`);
});
// --- end health server ---

type CommandModule = {
  name: string;
  public?: boolean;
  // Command modules are written against a message-shaped object and a
  // positional args array; utils/interactionMessage.cjs and
  // utils/slashCommands.cjs build both from the incoming interaction.
  // TODO-ts-migration modules shouldn't need discord, they can just import it..
  execute: (msg: any, args: string[], discord: typeof Discord) => any;
};

const { loadCommands } = require("./commandLoader.cjs");
const {
  formatChangelogMessage,
  broadcastToGuilds,
} = require("./utils/broadcast.cjs");
const { applySpoilerMiddleware } = require("./utils/spoiler.cjs");
const { argsFromInteraction } = require("./utils/slashCommands.cjs");
const { createInteractionMessage } = require("./utils/interactionMessage.cjs");
const { registerSlashCommands } = require("./scripts/deployCommands.cjs");

const commands: Collection<string, CommandModule> = new Collection(
  loadCommands().commands,
);

bot.once("ready", async () => {
  console.log("This bot is online");

  // Publish this build's slash commands so a deploy that adds a command or
  // changes its options takes effect without a separate manual step. A
  // guild registration (DISCORD_GUILD_ID) appears immediately, which is
  // what you want while developing; global ones can take up to an hour.
  try {
    const registered = await registerSlashCommands(bot);
    console.log(`Registered ${registered.length} slash command(s)`);
  } catch (error) {
    // A registration failure shouldn't take the bot down - whatever was
    // registered last time is still there and still dispatchable.
    console.error("Failed to register slash commands:", error);
  }

  ready = true;

  // Set bot's presence
  bot.user?.setPresence({
    activities: [{ name: `for /help`, type: ActivityType.Watching }],
    status: "online",
  });
});

bot.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) {
    console.log(`command not in list: ${interaction.commandName}`);
    return;
  }

  try {
    // Reserve the reply up front: Discord drops an interaction that isn't
    // acknowledged within three seconds, and some commands (notably
    // /adversaryrules, which renders a PNG) take longer than that.
    await interaction.deferReply();

    const args = argsFromInteraction(interaction, command);

    // If this command supports spoilering (see SPOILERABLE_COMMANDS) and
    // the user ticked its `spoiler` option, hand off a message whose
    // channel.send spoiler-tags whatever the command sends back. Every
    // other command gets the plain adapter, spoiler option or not.
    const { message } = applySpoilerMiddleware(
      interaction,
      createInteractionMessage(interaction),
    );

    await command.execute(message, args, Discord);
    // Some commands fire their sends without awaiting them, so wait for the
    // adapter's queue to drain before deciding whether anything was sent.
    await message.flush();

    // A command that deliberately says nothing (e.g. /reactionrole outside
    // its configured channel) would otherwise leave the interaction stuck
    // showing "thinking" forever.
    if (interaction.deferred && !interaction.replied) {
      await interaction.editReply("Nothing to send.");
    }
  } catch (error) {
    console.error(error);
    await respondWithError(interaction);
  }
});

async function respondWithError(
  interaction: Discord.ChatInputCommandInteraction,
) {
  const content = "Something went wrong running that command.";
  try {
    if (interaction.replied) {
      await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
    } else if (interaction.deferred) {
      await interaction.editReply(content);
    } else {
      await interaction.reply({ content, flags: MessageFlags.Ephemeral });
    }
  } catch (replyError) {
    console.error("Failed to report command error:", replyError);
  }
}

// use DISCORD_TOKEN from env
if (!process.env.DISCORD_TOKEN) {
  console.error("Missing DISCORD_TOKEN in environment");
  process.exit(1);
}
await bot.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error("Failed to login:", err);
  process.exit(1);
});
