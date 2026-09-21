#!/usr/bin/env node
/**
 * Regenerates the "Bot Commands" section of README.md and the docs/
 * GitHub Pages site (docs/index.md + docs/commands/<name>.md) from each
 * command module's own `description`/`details`/`options` exports, via the
 * shared loader in commandLoader.js. The syntax lines come from the same
 * option declarations that get registered with Discord (formatUsage), so
 * the docs describe the command Discord actually offers. This is a manual step, not wired into
 * CI - run `npm run docs:generate` after adding or changing a command and
 * commit the result.
 */
const fs = require("fs");
const path = require("path");
const { loadCommands } = require("../commandLoader.cjs");
const { formatUsage, declaredOptions } = require("../utils/slashCommands.cjs");

const ROOT = path.join(__dirname, "..");
const README_PATH = path.join(ROOT, "README.md");
const DOCS_DIR = path.join(ROOT, "docs");
const COMMAND_DOCS_DIR = path.join(DOCS_DIR, "commands");

const START_MARKER = "<!-- COMMANDS:START -->";
const END_MARKER = "<!-- COMMANDS:END -->";

function publicCommands() {
  const { commands } = loadCommands();
  return [...commands.values()]
    .filter((command) => command.public !== false)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function usageLines(command) {
  return formatUsage(command)
    .split("\n")
    .filter((line) => line.length > 0);
}

function readmeBulletFor(command) {
  const lines = usageLines(command);
  if (lines.length <= 1) {
    return `- \`${lines[0]}\``;
  }
  // Subcommand-based commands (/random) get one bullet per subcommand,
  // with the shared `/name` left on the parent bullet.
  const sub = lines
    .map((line) => `  - \`${line.slice(`/${command.name} `.length)}\``)
    .join("\n");
  return `- \`/${command.name}\`\n${sub}`;
}

function updateReadme(commands) {
  const readme = fs.readFileSync(README_PATH, "utf8");
  const startIdx = readme.indexOf(START_MARKER);
  const endIdx = readme.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(
      `README.md is missing the ${START_MARKER}/${END_MARKER} markers`,
    );
  }

  const body = commands.map(readmeBulletFor).join("\n");
  const updated =
    readme.slice(0, startIdx + START_MARKER.length) +
    "\n" +
    body +
    "\n" +
    readme.slice(endIdx);

  fs.writeFileSync(README_PATH, updated);
}

function commandUsageBlock(command) {
  return formatUsage(command);
}

/**
 * The command's options as a table, so the reference page says what each
 * one accepts (including the fixed choice lists Discord offers) rather
 * than just naming it in the usage line.
 */
function optionsTable(command) {
  const rows = [];

  const describe = (option, prefix = "") => {
    const choices = option.choices
      ? `. One of: ${option.choices.map((choice) => `\`${choice.value}\``).join(", ")}`
      : "";
    const description = option.description.replace(/\.\s*$/, "");
    rows.push(
      `| \`${prefix}${option.name}\` | ${option.type} | ${option.required ? "yes" : "no"} | ${description}${choices}. |`,
    );
  };

  if (command.subcommands) {
    for (const sub of command.subcommands) {
      for (const option of sub.options || []) describe(option, `${sub.name} `);
    }
  } else {
    for (const option of declaredOptions(command)) describe(option);
  }

  if (rows.length === 0) return "";
  return [
    "",
    "## Options",
    "",
    "| Option | Type | Required | Description |",
    "| --- | --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
}

function commandPageMarkdown(command) {
  return `---
title: "/${command.name}"
layout: default
---

[← Back to command list](../index.html)

# /${command.name}

${command.description || ""}

## Usage

\`\`\`
${commandUsageBlock(command)}
\`\`\`
${optionsTable(command)}
${command.details || "_No detailed description yet._"}
`;
}

function indexMarkdown(commands) {
  const items = commands
    .map(
      (command) =>
        `- [/${command.name}](commands/${command.name}.html)${command.description ? ` - ${command.description}` : ""}`,
    )
    .join("\n");
  return `---
title: "SI_Card_Bot commands"
layout: default
---

# SI_Card_Bot command reference

${items}
`;
}

function main() {
  const commands = publicCommands();

  updateReadme(commands);

  fs.mkdirSync(COMMAND_DOCS_DIR, { recursive: true });
  fs.writeFileSync(path.join(DOCS_DIR, "index.md"), indexMarkdown(commands));
  for (const command of commands) {
    fs.writeFileSync(
      path.join(COMMAND_DOCS_DIR, `${command.name}.md`),
      commandPageMarkdown(command),
    );
  }

  console.log(`Regenerated README.md and docs/ (${commands.length} commands).`);
}

main();
