const s = require("./sendCardLink.js");
const ImageNames = require("./ImageNames.js");

module.exports = {
  name: "minor",
  description: "Minor card search",
  details: "Same lookup as /power, restricted to Minor Power cards.",
  public: true,
  options: [
    {
      name: "card",
      description: "Minor Power card name",
      type: "string",
      required: true,
    },
  ],

  async execute(msg, args) {
    await s.sendCardLink(
      msg,
      args,
      ImageNames.minor,
      "https://sick.oberien.de/imgs/powers/",
    );
  },
};
