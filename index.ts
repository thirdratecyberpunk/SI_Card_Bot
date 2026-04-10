/* Loads all associated commands and exposes health endpoint
 */

import dotenv from "dotenv";
import { readdirSync } from "fs";
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

app.listen(HEALTH_PORT, () => {
  console.log(`Health endpoints listening on port ${HEALTH_PORT}`);
});
// --- end health server ---

type CommandModule = {
  name: string;
  // TODO-ts-migration modules shouldn't need discord, they can just import it..
  execute: (msg: Discord.Message, args: string[], discord: typeof Discord) => any;
};

const commands: Collection<string, CommandModule> = new Collection();

const commandFiles = readdirSync("./commands/").filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`) as CommandModule;
  if (!command?.name || typeof command.execute !== "function") {
    continue;
  }

  commands.set(command.name, command);
}

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
  if (!msg.content.startsWith(PREFIX)) return;
  let args = msg.content.slice(PREFIX.length).trim().split(" ");
  let command = args.shift()?.toLowerCase();
  console.log(command);

  if (!command) return;

  if (!commands.has(command)) return console.log("command not in list");

  try {
    await commands.get(command)?.execute(msg, args, Discord);
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
