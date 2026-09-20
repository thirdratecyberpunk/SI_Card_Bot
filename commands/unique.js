const s = require("./sendCardLink.js");
const ImageNames = require("./ImageNames.js");

module.exports = {
  name: "unique",
  description: "Unique card search",
  details: "Same lookup as /power, restricted to spirits' Unique Power cards.",
  public: true,
  options: [
    {
      name: "card",
      description: "Unique Power card name",
      type: "string",
      required: true,
    },
  ],

  async execute(msg, args) {
    await s.sendCardLink(
      msg,
      args,
      ImageNames.unique,
      "https://sick.oberien.de/imgs/powers/",
    );
  },
};
