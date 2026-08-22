const s = require("./sendCardLink.js");
const ImageNames = require("./ImageNames.js");

module.exports = {
  name: "blight",
  description: "Blight card search",
  usage: "[card name]",
  details:
    "Looks up a Blight card by name and returns its SICK card image link.",
  public: true,

  async execute(msg, args) {
    await s.sendCardLink(
      msg,
      args,
      ImageNames.blight,
      "https://sick.oberien.de/imgs/blights/",
    );
  },
};
