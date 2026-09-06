/* Loads all associated commands and exposes health endpoint
 */

import dotenv from "dotenv";
import { createRequire } from "module";
import {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  ActivityType,
} from "discord.js";
import * as Discord from "discord.js";
import express from "express";

dotenv.config();

// TODO-ts-migration remove this once everything uses `import`
const require = createRequire(import.meta.url);

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message],
});

const PREFIX = "-";
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
  // TODO-ts-migration modules shouldn't need discord, they can just import it..
  execute: (
    msg: Discord.Message,
    args: string[],
    discord: typeof Discord,
  ) => any;
};

const { loadCommands } = require("./commandLoader.cjs");
const {
  formatChangelogMessage,
  broadcastToGuilds,
} = require("./utils/broadcast.cjs");
const { applySpoilerMiddleware } = require("./utils/spoiler.cjs");

const commands: Collection<string, CommandModule> = new Collection(
  loadCommands().commands,
);

bot.once("ready", async () => {
  console.log("This bot is online");
  ready = true;

  // Set bot's presence
  bot.user?.setPresence({
    activities: [{ name: `for -help`, type: ActivityType.Watching }],
    status: "online",
  });

  console.log(commands.get("spirit")?.name);
});

bot.on("messageCreate", async (msg) => {
  // If the whole message is wrapped in spoiler markdown and it dispatches
  // to -search, -event, or -fear (see SPOILERABLE_COMMANDS), unwrap it for
  // command parsing and hand off a message whose channel.send
  // spoiler-tags whatever the command sends back. Any other command
  // passes through untouched, spoiler wrapper or not.
  const { content, message } = applySpoilerMiddleware(msg, PREFIX);

  if (!content.startsWith(PREFIX)) return;
  let args = content.slice(PREFIX.length).trim().split(" ");
  let command = args.shift()?.toLowerCase();
  console.log(command);

  if (!command) return;

  if (!commands.has(command)) return console.log("command not in list");

  try {
    await commands.get(command)?.execute(message, args, Discord);
  } catch (error) {
    console.error(error);
  }
});

// use DISCORD_TOKEN from env
if (!process.env.DISCORD_TOKEN) {
  console.error("Missing DISCORD_TOKEN in environment");
  process.exit(1);
}
await bot.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error("Failed to login:", err);
  process.exit(1);
});
