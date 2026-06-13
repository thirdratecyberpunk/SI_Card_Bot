const { ad } = require("./AdversaryNames.js");
const InvaderDeckCard = require("./InvaderDeckCard.js");
const Deck = require("./Deck.js");
// TODO: refactor this to use validity checks from standardised utils
// TODO: fix Wave of Immigration reminder not appearing

/**
 * Returns whether a single adversary is valid
 */
const isValidAdversaryLevel = (adversaryLevel) => {
  return !(isNaN(adversaryLevel) || adversaryLevel < 0 || adversaryLevel > 6);
};

/**
 * Command that returns the invader deck setup for a given
 * adversary level
 */
module.exports = {
  name: "invaderdeck",
  description:
    "Calculates the invader deck for a given adversary/double adversary set up.",
  public: true,
  async execute(msg, args) {
    console.log("ad is", ad);
    try {
      if (args.length < 2) {
        throw new Error(
          "Please specify at least one adversary and a numeric level (-invaderdeck prussia 6) or (-invaderdeck prussia 6 scotland 6).",
        );
      }

      // TODO: will probably need to migrate the double invader string check
      // to a separate class when I get around to making a -double command
      let leadingAdversarySearchString = args[0].toLowerCase();
      let leadingAdversaryLevel = parseInt(args[1]);

      if (!isValidAdversaryLevel(leadingAdversaryLevel)) {
        throw new Error(
          "Please specify a numeric level between 0 and 6 for the leading adversary.",
        );
      }

      // checks if there's a corresponding adversary for the leading adversary search string
      let leadingAdversary;
      let leadingAdversaryFound = false;
      for (const [name, adversary] of ad) {
        // if there is a panel with that string in the title, return it
        // checks for exact title matches to avoid Prussia - Russia problem
        if (adversary.title.toLowerCase() == leadingAdversarySearchString) {
          leadingAdversary = adversary;
          leadingAdversaryFound = true;
          break;
        }
        // alias
        else {
          for (const alias of adversary.alias) {
            if (
              alias.toLowerCase().indexOf(leadingAdversarySearchString) >= 0
            ) {
              leadingAdversary = adversary;
              leadingAdversaryFound = true;
              break;
            }
          }
        }
      }

      if (!leadingAdversaryFound) {
        throw new Error(
          "Leading adversary not found, try using the names or nicknames listed in -adversary.",
        );
      }

      let supportingAdversary, supportingAdversaryLevel;
      if (args.length >= 4) {
        let supportingAdversarySearchString = args[2].toLowerCase();
        supportingAdversaryLevel = parseInt(args[3]);

        if (!isValidAdversaryLevel(supportingAdversaryLevel)) {
          throw new Error(
            "Please specify a numeric level between 0 and 6 for the supporting adversary.",
          );
        }

        // checks if there's a corresponding adversary for the supporting adversary search string
        let supportingAdversaryFound = false;

        for (const [name, adversary] of ad) {
          // if there is a panel with that string in the title, return it
          // checks for exact title matches to avoid Prussia - Russia problem
          if (
            adversary.title.toLowerCase() == supportingAdversarySearchString
          ) {
            supportingAdversary = adversary;
            supportingAdversaryFound = true;
            break;
          }
          // alias
          else {
            for (const alias of adversary.alias) {
              if (
                alias.toLowerCase().indexOf(supportingAdversarySearchString) >=
                0
              ) {
                supportingAdversary = adversary;
                supportingAdversaryFound = true;
                break;
              }
            }
          }
        }

        if (!supportingAdversaryFound) {
          throw new Error(
            "Supporting adversary not found, try using the names or nicknames listed in -adversary.",
          );
        }
      }

      if (
        supportingAdversary &&
        supportingAdversary.name == leadingAdversary.name
      ) {
        throw new Error("Please specify two different adversaries.");
      }

      const deck = new Deck();
      if (supportingAdversary) {
        deck.applyAdv(supportingAdversary, supportingAdversaryLevel);
      }
      deck.applyAdv(leadingAdversary, leadingAdversaryLevel);

      // hardcoded check for applying HLC reminder card after constructing
      // deck - not the most elegant way but it's just HLC that's awkward
      // for now so
      const hasSupportingHLC =
        supportingAdversary &&
        supportingAdversary.title === "habsburg_livestock" &&
        supportingAdversary.adversaryLevel >= 5;
      const hasLeadingHLC =
        leadingAdversary &&
        leadingAdversary.title === "habsburg_livestock" &&
        leadingAdversary.adversaryLevel >= 5;

      if (hasSupportingHLC || hasLeadingHLC) {
        const hlcReminderCard = new InvaderDeckCard(
          0,
          "Wave of Immigration Reminder",
        );
        deck.cards.splice(5, 0, hlcReminderCard);
      }

      return msg.channel.send(deck.formattedDeck());
    } catch (e) {
      console.log(e);
      return msg.channel.send(e.toString());
    }
  },
  Deck: Deck,
  InvaderDeckCard: InvaderDeckCard,
};
