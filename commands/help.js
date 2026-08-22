const { loadCommands } = require("../commandLoader.cjs");

const INTRO =
  "See [Github link](<https://github.com/thirdratecyberpunk/SI_Card_Bot>) for invite\n\nList of commands:";

module.exports = {
  name: "help",
  description: "lists of commands",
  usage: "[command name]",
  details:
    "Lists every available command with its usage. Give a specific command name (e.g. `-help board`) to get that command's full usage and description.",
  public: true,
  async execute(msg, args) {
    const { commands } = loadCommands();

    if (args[0]) {
      const command = commands.get(args[0].toLowerCase());
      if (!command) {
        await msg.channel.send(
          `No command called \`-${args[0]}\`. Run \`-help\` for the full list.`,
        );
        return;
      }
      await msg.channel.send(formatCommandDetails(command));
      return;
    }

    await msg.channel.send(formatCommandList(commands));
  },
};

/**
 * Every command's usage line, formatted the same way it's displayed:
 * `-name usage-args`. Multi-form commands (e.g. -random) embed newlines in
 * `usage`; continuation lines are indented instead of repeating `-name`.
 */
function formatUsageLine(command) {
  const usage = (command.usage || "").split("\n");
  const first = `-${command.name}${usage[0] ? " " + usage[0] : ""}`;
  const rest = usage.slice(1).map((line) => `  ${line}`);
  return [first, ...rest].join("\n");
}

function formatCommandList(commands) {
  const visible = [...commands.values()]
    .filter((command) => command.public !== false)
    .sort((a, b) => a.name.localeCompare(b.name));

  const lines = visible.map(formatUsageLine).join("\n");
  return `${INTRO}\n\`\`\`\n${lines}\n\`\`\`\nRun \`-help [command name]\` for a description of a specific command.`;
}

function formatCommandDetails(command) {
  const parts = [
    `**-${command.name}**`,
    `Usage: \`${formatUsageLine(command)}\``,
  ];
  if (command.details) parts.push(command.details);
  return parts.join("\n\n");
}
