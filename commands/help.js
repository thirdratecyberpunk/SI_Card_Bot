const { loadCommands } = require("../commandLoader.cjs");
const { formatUsage } = require("../utils/slashCommands.cjs");

const INTRO =
  "See [Github link](<https://github.com/thirdratecyberpunk/SI_Card_Bot>) for invite\n\nList of commands:";

module.exports = {
  name: "help",
  description: "lists of commands",
  details:
    "Lists every available command with its usage. Give a specific command name (e.g. `/help command:board`) to get that command's full usage and description.",
  public: true,
  options: [
    {
      name: "command",
      description: "Command to describe (blank lists every command)",
      type: "string",
    },
  ],
  async execute(msg, args) {
    const { commands } = loadCommands();

    if (args[0]) {
      const command = commands.get(args[0].toLowerCase());
      if (!command) {
        await msg.channel.send(
          `No command called \`/${args[0]}\`. Run \`/help\` for the full list.`,
        );
        return;
      }
      await msg.channel.send(formatCommandDetails(command));
      return;
    }

    await msg.channel.send(formatCommandList(commands));
  },
};

function formatCommandList(commands) {
  const visible = [...commands.values()]
    .filter((command) => command.public !== false)
    .sort((a, b) => a.name.localeCompare(b.name));

  const lines = visible.map(formatUsage).join("\n");
  return `${INTRO}\n\`\`\`\n${lines}\n\`\`\`\nRun \`/help command:<name>\` for a description of a specific command.`;
}

function formatCommandDetails(command) {
  const parts = [
    `**/${command.name}**`,
    `Usage: \`\`\`\n${formatUsage(command)}\n\`\`\``,
  ];
  if (command.details) parts.push(command.details);
  return parts.join("\n\n");
}
