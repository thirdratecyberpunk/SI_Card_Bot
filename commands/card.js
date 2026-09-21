const power = require("./power.js");

module.exports = {
  name: "card",
  description: "Card Search",
  details:
    "Alias for /power - looks up a Power card by name and returns its card image link.",
  public: true,
  options: [
    {
      name: "card",
      description: "Power card name",
      type: "string",
      required: true,
    },
  ],
  async execute(msg, args) {
    await power.execute(msg, args);
  },
};
