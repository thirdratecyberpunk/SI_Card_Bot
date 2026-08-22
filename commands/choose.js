const globals = require("../globals.cjs");

module.exports = {
  name: "choose",
  description: "Choose from previously found results",
  usage: "[number]",
  details:
    "Picks one of the numbered options from the bot's most recent multi-match prompt (e.g. when an -event search matches more than one card) and sends the chosen value. Only works immediately after such a prompt; the option list isn't saved between messages.",
  public: true,
  async execute(msg, args) {
    if (args.length == 1) {
      if (!(globals.choices === undefined || globals.choices == 0)) {
        const idx = parseInt(args[0]) - 1;
        if (idx > -1 && idx < globals.choices.length) {
          let choice = globals.choices[idx];
          globals.choices = [];
          return await msg.channel.send(choice.value);
        } else {
          return await msg.channel.send(
            "An invalid option was chosen, please choose a value between 1 and " +
              globals.choices.length +
              " .",
          );
        }
      } else {
        return await msg.channel.send(
          "Please use this command after being prompted by the bot.",
        );
      }
    } else {
      return await msg.channel.send(
        "The _-choose_ command requires a single number",
      );
    }
  },
};
