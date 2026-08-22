/**
 * Sends an image of the power progression for that spirit
 */
const spirit = require("./spirit.js");

module.exports = {
  name: "progression",
  description: "Gets the power progression for a spirit",
  usage: "(spirit)",
  details:
    "Looks up a spirit by name and returns its power progression image, if one exists for that spirit.",
  public: true,

  async execute(msg, args) {
    try {
      if (args.length < 1) {
        throw new Error("Please provide at least 3 letters to query with.");
      }

      // retrieves the closest spirit to the search term
      const possibleSpirits = spirit.searchForSpirit(
        args.join(" ").toLowerCase(),
      );
      let message;

      // if levenshtein returns a single spirit, return that
      if (possibleSpirits.length === 1) {
        const spirit = possibleSpirits[0];

        if (spirit.powerProgression) {
          message = spirit.powerProgression;
        } else {
          message = `${spirit.name} (${spirit.emote}) does not have a power progression.`;
        }
        return msg.channel.send(message);
      } else {
        throw new Error("Try again with a more specific string.");
      }
    } catch (e) {
      console.log(e);
      return msg.channel.send(e.toString());
    }
  },
};
