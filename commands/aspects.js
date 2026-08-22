/**
 * Command that lists all aspects for a given spirit or the entire list.
 */
const { spirits } = require("./spiritNames.js");
const spiritCommand = require("./spirit.js"); // to reuse searchForSpirit
const { PaginatedMessage } = require("@sapphire/discord.js-utilities");

module.exports = {
  name: "aspects",
  description: "Lists all aspects or lists aspects for a given spirit.",
  usage: "(spirit name)",
  details:
    "Lists the Aspects available for a given spirit, with each one's emote. With no arguments, sends a paginated list of every spirit's aspects.",
  public: true,
  async execute(msg, args) {
    try {
      if (!args || args.length === 0) {
        const paginated = new PaginatedMessage();

        for (const sp of spirits) {
          if (!sp || !Array.isArray(sp.aspects) || sp.aspects.length === 0)
            continue;

          paginated.addPageEmbed((embed) =>
            embed
              .setTitle(`${sp.name} ${sp.emote}`)
              .setDescription(formatAspectsList(sp.aspects)),
          );
        }

        return paginated.run(msg);
      }

      const input = args.join(" ").trim();

      // Use the same levenshtein-based search as spirit.js
      const possible = spiritCommand.searchForSpirit(input.toLowerCase());

      // If searchForSpirit returns more than one, ask user to be more specific (same behaviour as spirit command)
      if (!Array.isArray(possible) || possible.length !== 1) {
        return msg.channel.send(
          "Multiple spirits matched. Try a more specific string.",
        );
      }

      const spirit = possible[0];

      if (!spirit.aspects || spirit.aspects.length === 0) {
        return msg.channel.send(
          `${spirit.name} (${spirit.emote}) has no aspects.`,
        );
      }
      const out =
        `${spirit.name} (${spirit.emote}) has the following aspects:\n` +
        formatAspectsList(spirit.aspects);
      return msg.channel.send(out);
    } catch (e) {
      console.error(e);
      return msg.channel.send("Error searching for aspects: " + e.toString());
    }
  },
};

function formatAspectsList(aspects = []) {
  if (!Array.isArray(aspects) || aspects.length === 0) return "(no aspects)";
  return aspects.map((a) => `${a.name} (${a.emote})`).join(", ");
}
