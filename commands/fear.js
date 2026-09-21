const { PaginatedMessage } = require("@sapphire/discord.js-utilities");
const { paginationTarget } = require("../utils/interactionMessage.cjs");
const s = require("./sendCardLink");
const ImageNames = require("./ImageNames.js");
const { fearCardText } = require("./fearCardText.js");

const FEAR_CARDS_PER_PAGE = 12;

module.exports = {
  name: "fear",
  description: "Fear card search",
  details:
    "Looks up a Fear card by name and returns its SICK card image link. With no card given, sends a paginated alphabetical list of every Fear card's title. Set the `level` option (1, 2 or 3) to get that level's text instead, as a message rather than the card image - SICK's own page never exposes this text, it only ever renders the image. Set the `spoiler` option to have the bot send the result as a blurred, click-to-reveal spoiler.",
  public: true,
  spoilerable: true,
  options: [
    {
      name: "card",
      description: "Fear card name (blank lists every fear card)",
      type: "string",
    },
    {
      name: "level",
      description: "Send this terror level's text instead of the card image",
      type: "integer",
      choices: [
        { name: "Level 1", value: 1 },
        { name: "Level 2", value: 2 },
        { name: "Level 3", value: 3 },
      ],
    },
  ],

  async execute(msg, args) {
    if (args.length === 0) {
      return sendFearCardList(msg);
    }

    const level = parseLevel(args[args.length - 1]);
    if (level) {
      return sendFearCardText(msg, args.slice(0, -1), level);
    }

    await s.sendCardLink(
      msg,
      args,
      ImageNames.fear,
      "https://sick.oberien.de/imgs/fears/",
    );
  },
};

/**
 * Sends a paginated list of every Fear card's title, alphabetically - same
 * style as /spirit's list with no args.
 */
function sendFearCardList(msg) {
  const sorted = [...fearCardText].sort((a, b) => a.name.localeCompare(b.name));
  const paginated = new PaginatedMessage();

  for (let i = 0; i < sorted.length; i += FEAR_CARDS_PER_PAGE) {
    const chunk = sorted.slice(i, i + FEAR_CARDS_PER_PAGE);
    paginated.addPageEmbed((embed) =>
      embed
        .setTitle("Fear Cards")
        .setDescription(chunk.map((card) => card.name).join("\n")),
    );
  }

  return paginated.run(paginationTarget(msg));
}

/**
 * Parses a trailing "1"/"2"/"3" arg as a Fear card level, or returns null
 * if it isn't one - the whole of args is then treated as the card name,
 * same as before this level support existed.
 */
function parseLevel(arg) {
  const level = parseInt(arg, 10);
  return level >= 1 && level <= 3 ? level : null;
}

/**
 * Sends a Fear card's text for one level as a plain message. SICK's own
 * page only ever renders the card image and never exposes this text, so
 * it's looked up from fearCardText.js - a local snapshot of the card
 * katalog's own data, matched to a name the same way sendCardLink.js
 * matches image links.
 */
function sendFearCardText(msg, nameArgs, level) {
  const name = nameArgs.filter((arg) => String(arg).trim().length > 0);
  if (name.length === 0) {
    return msg.channel.send(
      "Give a fear card name too, e.g. `/fear card:isolation level:2`.",
    );
  }

  const slug = s.getCardName(name, ImageNames.fear);
  const card = fearCardText.find((fear) => fear.slug === slug);
  if (!card) {
    return msg.channel.send("Incorrect name, try using /search");
  }

  return msg.channel.send(
    `**${card.name}** (Level ${level})\n${card[`level${level}`]}`,
  );
}
