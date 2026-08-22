const { parseSetupArgs, computeInvaderDeck } = require("./AdversaryNames.js");

/**
 * Command that returns the invader deck setup for a given
 * adversary or double‑adversary setup.
 */
module.exports = {
  name: "invaderdeck",
  description:
    "Calculates the invader deck for a given adversary/double adversary set up.",
  usage:
    "(leadingAdversary leadingAdversaryLevel) (supportingAdversary supportingAdversaryLevel)",
  details:
    "Calculates and lists the invader deck contents for a single adversary, or for a leading+supporting double-adversary setup, at the given difficulty levels.",
  public: true,

  async execute(msg, args) {
    try {
      // Parse + validate arguments (same as fear deck)
      const {
        leadingAdversary,
        leadingLevel,
        supportingAdversary,
        supportingLevel,
      } = parseSetupArgs(args);

      // Compute the deck using the extracted helper
      const deck = computeInvaderDeck(
        leadingAdversary,
        leadingLevel,
        supportingAdversary,
        supportingLevel,
      );

      // Format output
      const deckMessage = `${leadingAdversary.emote} ${leadingLevel}${
        supportingAdversary?.emote || ""
      }${supportingLevel || ""} invader deck is: ${deck.formattedDeck()}`;

      return msg.channel.send(deckMessage);
    } catch (e) {
      console.log(e);
      return msg.channel.send(e.toString());
    }
  },
};
