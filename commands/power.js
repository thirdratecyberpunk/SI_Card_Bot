const s = require("./sendCardLink.js");
const ImageNames = require("./ImageNames.js");

module.exports = {
  name: "power",
  description: "Power Search",
  usage: "[card name]",
  details:
    "Looks up a Power card by name - matching an exact substring first, then falling back to the closest Levenshtein-distance match - and returns its SICK card image link.",
  public: true,

  async execute(msg, args) {
    var html = "https://sick.oberien.de/imgs/powers/";

    await s.sendCardLink(msg, args, ImageNames.power, html);
  },
};
