const s = require("./sendCardLink.js");
const ImageNames = require("./ImageNames.js");

module.exports = {
  name: "major",
  description: "Major card search",
  details: "Same lookup as /power, restricted to Major Power cards.",
  public: true,
  options: [
    {
      name: "card",
      description: "Major Power card name",
      type: "string",
      required: true,
    },
  ],

  async execute(msg, args) {
    await s.sendCardLink(
      msg,
      args,
      ImageNames.major,
      "https://sick.oberien.de/imgs/powers/",
    );
  },
};
