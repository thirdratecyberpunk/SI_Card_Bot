/* Loads all associated commands and exposes health endpoint
 */

require("dotenv").config();
const fs = require("fs");
const Discord = require("discord.js");
const express = require("express");

const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  ActivityType,
} = require("discord.js");
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

app.get("/healthz", (req, res) => {
  // basic liveness: process up
  res.status(200).send("ok");
});

app.get("/ready", (req, res) => {
  // readiness: bot connected and ready to serve
  if (ready) return res.status(200).send("ready");
  return res.status(503).send("not ready");
});

app.listen(HEALTH_PORT, () => {
  console.log(`Health endpoints listening on port ${HEALTH_PORT}`);
});
// --- end health server ---

commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands/")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.set(command.name, command);
}

bot.once("ready", async () => {
  console.log("This bot is online");
  ready = true;

  // Set bot's presence
  bot.user.setPresence({
    activities: [{ name: `for -help`, type: ActivityType.Watching }],
    status: "online",
  });

  console.log(commands.get("spirit").name);
});

bot.on("messageCreate", async (msg) => {
  if (!msg.content.startsWith(PREFIX)) return;
  let args = msg.content.slice(PREFIX.length).trim().split(" ");
  let command = args.shift().toLowerCase();
  console.log(command);

  if (!commands.has(command)) return console.log("command not in list");

  try {
    await commands.get(command).execute(msg, args, Discord);
  } catch (error) {
    console.error(error);
  }
});

// use DISCORD_TOKEN from env
if (!process.env.DISCORD_TOKEN) {
  console.error("Missing DISCORD_TOKEN in environment");
  process.exit(1);
}
bot.login(process.env.DISCORD_TOKEN).catch((err) => {
  console.error("Failed to login:", err);
  process.exit(1);
});
