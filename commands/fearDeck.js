const { parseSetupArgs, computeFearDeck } = require("./AdversaryNames.js");

/**
 * Command that returns the fear deck setup for a given
 * adversary level
 */
module.exports = {
  name: "feardeck",
  description:
    "Calculates the fear deck for a given adversary/double adversary set up.",
  usage:
    "(leadingAdversary leadingAdversaryLevel) (supportingAdversary supportingAdversaryLevel)",
  details:
    "Calculates the fear card counts (shown as an X/Y/Z split) for a single adversary, or for a leading+supporting double-adversary setup, at the given difficulty levels.",
  public: true,
  async execute(msg, args) {
    try {
      // parseSetupArgs will validate args length, tokens, and levels
      const {
        leadingAdversary,
        leadingLevel,
        supportingAdversary,
        supportingLevel,
      } = parseSetupArgs(args);

      const fearDeck = computeFearDeck(
        leadingAdversary,
        leadingLevel,
        supportingAdversary,
        supportingLevel,
      );

      const fearDeckMessage = `${leadingAdversary.emote} ${leadingLevel}${
        supportingAdversary?.emote || ""
      }${supportingLevel || ""} fear deck is (${fearDeck.join("/")})`;

      return msg.channel.send(fearDeckMessage);
    } catch (e) {
      console.log(e);
      return msg.channel.send(e.toString());
    }
  },
};
