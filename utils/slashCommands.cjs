/**
 * Translation layer between the command modules in commands/ and Discord's
 * slash command API.
 *
 * Command modules keep their original `execute(msg, args, Discord)` shape -
 * they were written against a positional `args` array and there's no value
 * in rewriting thirty of them to read named options. Instead each module
 * declares the named options it wants Discord to collect (`options`, or
 * `subcommands` for /random's spirit/adversary/double/... split), this
 * module turns that declaration into the JSON Discord expects, and
 * `argsFromInteraction` turns a user's filled-in options back into the
 * positional array the module already knows how to parse.
 */
const { ApplicationCommandOptionType } = require("discord.js");

const OPTION_TYPES = {
  string: ApplicationCommandOptionType.String,
  integer: ApplicationCommandOptionType.Integer,
  boolean: ApplicationCommandOptionType.Boolean,
};

// Discord rejects a command whose description is empty or over 100 chars,
// so a module's `description` is trimmed to fit rather than failing the
// whole registration.
const MAX_DESCRIPTION_LENGTH = 100;

function truncate(text, limit = MAX_DESCRIPTION_LENGTH) {
  const value = (text || "").trim();
  if (value.length <= limit) return value;
  return value.slice(0, limit - 1).trimEnd() + "…";
}

function optionJson(option) {
  const type = OPTION_TYPES[option.type];
  if (!type) {
    throw new Error(
      `Unknown slash option type "${option.type}" on option "${option.name}"`,
    );
  }

  const json = {
    type,
    name: option.name,
    description: truncate(option.description),
    required: Boolean(option.required),
  };
  if (option.choices) json.choices = option.choices;
  if (option.minValue !== undefined) json.min_value = option.minValue;
  if (option.maxValue !== undefined) json.max_value = option.maxValue;
  return json;
}

/**
 * Discord requires every required option to come before the optional ones.
 * Rather than making each module get the ordering right by hand, sort them
 * here - `argsFromInteraction` reads options in the module's declared
 * order, not this one, so re-ordering here can't scramble anyone's args.
 *
 * `middleware` options (the spoiler toggle) are registered like any other:
 * the flag only means the value is read by the dispatcher rather than
 * passed through to the command's args.
 */
function sortedOptions(options = []) {
  return [...options]
    .map(optionJson)
    .sort((a, b) => Number(b.required) - Number(a.required));
}

/**
 * The options a command declares, plus the `spoiler` toggle that replaces
 * the old "wrap the whole message in ||spoiler bars||" trick for the
 * commands that support it (see utils/spoiler.cjs).
 */
function declaredOptions(command) {
  const options = [...(command.options || [])];
  if (command.spoilerable) {
    options.push({
      name: "spoiler",
      description: "Send the result as a click-to-reveal spoiler",
      type: "boolean",
      middleware: true, // consumed by the spoiler middleware, not by execute()
    });
  }
  return options;
}

/**
 * Turns a command module into the JSON body Discord's application command
 * API expects. Accepted as-is by both `client.application.commands.set()`
 * and a REST PUT to the application-commands route.
 */
function buildSlashCommand(command) {
  const json = {
    name: command.name,
    description: truncate(command.description || command.name),
  };

  if (command.subcommands) {
    json.options = command.subcommands.map((sub) => ({
      type: ApplicationCommandOptionType.Subcommand,
      name: sub.name,
      description: truncate(sub.description),
      options: sortedOptions(sub.options),
    }));
    return json;
  }

  const options = sortedOptions(declaredOptions(command));
  if (options.length > 0) json.options = options;
  return json;
}

/**
 * Every public command's slash definition, ready to register.
 */
function buildSlashCommands(commands) {
  return [...commands.values()]
    .filter((command) => command.public !== false)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(buildSlashCommand);
}

function readOption(interaction, option) {
  switch (option.type) {
    case "integer":
      return interaction.options.getInteger(option.name);
    case "boolean":
      return interaction.options.getBoolean(option.name);
    default:
      return interaction.options.getString(option.name);
  }
}

/**
 * Collapses a set of named option values into the positional args array
 * the command module expects.
 *
 * Booleans behave like the flag words the prefix commands used to look for
 * anywhere in their args (e.g. `nosetup`), so they're appended at the end
 * and only when set. Everything else keeps its declared position: an
 * option left blank in the middle of the list becomes an empty string so
 * the ones after it don't slide left (`/random adversary max:5` must not
 * be read as a minimum of 5), while blanks trailing off the end are just
 * dropped.
 */
function optionArgs(interaction, options = []) {
  const positional = [];
  const flags = [];

  for (const option of options) {
    if (option.middleware) continue;
    const value = readOption(interaction, option);

    if (option.type === "boolean") {
      if (value === true) flags.push(option.flag || option.name);
      continue;
    }

    positional.push(
      value === null || value === undefined ? null : String(value),
    );
  }

  while (positional.length > 0 && positional[positional.length - 1] === null) {
    positional.pop();
  }

  return [...positional.map((value) => value ?? ""), ...flags];
}

/**
 * Builds the args array for one interaction. Subcommand-based commands get
 * the subcommand name as args[0], exactly where `-random spirit` used to
 * put it.
 */
function argsFromInteraction(interaction, command) {
  if (command.subcommands) {
    const name = interaction.options.getSubcommand();
    const subcommand = command.subcommands.find((sub) => sub.name === name);
    return [name, ...optionArgs(interaction, subcommand?.options)];
  }
  return optionArgs(interaction, declaredOptions(command));
}

/**
 * A command's syntax, written the way Discord's own command picker reads:
 * `<required>` first, `[optional]` after. Derived from the same option
 * declarations that get registered with Discord, so `/help` and the docs
 * site can't drift from what the command actually accepts.
 */
function formatUsage(command) {
  const render = (name, options = []) =>
    [
      `/${name}`,
      ...options
        .filter((option) => !option.hidden)
        .map((option) =>
          option.required ? `<${option.name}>` : `[${option.name}]`,
        ),
    ].join(" ");

  if (command.subcommands) {
    return command.subcommands
      .map((sub) => render(`${command.name} ${sub.name}`, sub.options))
      .join("\n");
  }
  return render(command.name, declaredOptions(command));
}

module.exports = {
  buildSlashCommand,
  formatUsage,
  buildSlashCommands,
  argsFromInteraction,
  declaredOptions,
  OPTION_TYPES,
  MAX_DESCRIPTION_LENGTH,
};
