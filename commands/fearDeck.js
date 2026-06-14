const { parseSetupArgs, computeFearDeck } = require("./AdversaryNames.js");

/**
 * Command that returns the fear deck setup for a given
 * adversary level
 */
module.exports = {
  name: "feardeck",
  description:
    "Calculates the fear deck for a given adversary/double adversary set up.",
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
