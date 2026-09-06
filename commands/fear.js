const s = require("./sendCardLink");
const ImageNames = require("./ImageNames.js");
const { fearCardText } = require("./fearCardText.js");

module.exports = {
  name: "fear",
  description: "Fear card search",
  usage: "[fear name] (level)",
  details:
    "Looks up a Fear card by name and returns its SICK card image link. Give a level (1, 2 or 3) after the name (e.g. `-fear isolation 2`) to get that level's text instead, as a message rather than the card image - SICK's own page never exposes this text, it only ever renders the image. Wrap the whole message in spoiler bars (e.g. `||-fear isolation||`) to have the bot send the card as a blurred, click-to-reveal spoiler image.",
  public: true,

  async execute(msg, args) {
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
  if (nameArgs.length === 0) {
    return msg.channel.send(
      "Give a fear card name too, e.g. `-fear isolation 2`.",
    );
  }

  const slug = s.getCardName(nameArgs, ImageNames.fear);
  const card = fearCardText.find((fear) => fear.slug === slug);
  if (!card) {
    return msg.channel.send("Incorrect name, try using -search");
  }

  return msg.channel.send(
    `**${card.name}** (Level ${level})\n${card[`level${level}`]}`,
  );
}
