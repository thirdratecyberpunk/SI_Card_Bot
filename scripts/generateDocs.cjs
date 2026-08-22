#!/usr/bin/env node
/**
 * Regenerates the "Bot Commands" section of README.md and the docs/
 * GitHub Pages site (docs/index.md + docs/commands/<name>.md) from each
 * command module's own `usage`/`description`/`details` exports, via the
 * shared loader in commandLoader.js. This is a manual step, not wired into
 * CI - run `npm run docs:generate` after adding or changing a command and
 * commit the result.
 */
const fs = require("fs");
const path = require("path");
const { loadCommands } = require("../commandLoader.cjs");

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
  return (command.usage || "").split("\n").filter((line) => line.length > 0);
}

function readmeBulletFor(command) {
  const lines = usageLines(command);
  if (lines.length <= 1) {
    return `- \`-${command.name}${lines[0] ? " " + lines[0] : ""}\``;
  }
  const sub = lines.map((line) => `  - \`${line}\``).join("\n");
  return `- \`-${command.name}\`\n${sub}`;
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
  const lines = usageLines(command);
  if (lines.length === 0) return `-${command.name}`;
  return lines.map((line) => `-${command.name} ${line}`.trim()).join("\n");
}

function commandPageMarkdown(command) {
  return `---
title: "-${command.name}"
layout: default
---

[← Back to command list](../index.html)

# -${command.name}

${command.description || ""}

## Usage

\`\`\`
${commandUsageBlock(command)}
\`\`\`

${command.details || "_No detailed description yet._"}
`;
}

function indexMarkdown(commands) {
  const items = commands
    .map(
      (command) =>
        `- [-${command.name}](commands/${command.name}.html)${command.description ? ` - ${command.description}` : ""}`,
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
