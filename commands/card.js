const power = require("./power.js");

module.exports = {
  name: "card",
  description: "Card Search",
  usage: "[card name]",
  details:
    "Alias for -power - looks up a Power card by name and returns its card image link.",
  public: true,
  async execute(msg, args) {
    await power.execute(msg, args);
  },
};
