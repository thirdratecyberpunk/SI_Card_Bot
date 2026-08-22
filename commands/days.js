// command that returns a days that never were for
// a given user
const draw = require("./draw.js");

module.exports = {
  name: "dtnw",
  description:
    "Draws a days that never were. Defaults to the 6/6 DTNW if no player count is given.",
  usage: "[player count]",
  details:
    "Draws a 'Days That Never Were' setup - a batch of Major and Minor cards. Defaults to the larger 6/6 draw (for 3+ players); give a player count of 1 or 2 for the smaller 4/4 draw (1 player also gets an extra time-gain reminder).",
  public: true, //has to be true to show as a command
  async execute(msg, args) {
    try {
      let smallDays;
      // assume that they want the big DTNW if not specified
      let numPlayers = 3;
      // check to see if the user has specified
      if (args.length < 1) {
        smallDays = false;
      } else {
        numPlayers = parseInt(args[0]) ? parseInt(args[0]) : 1;
        smallDays = numPlayers < 3;
      }
      let message = "";
      if (numPlayers == 1) {
        message += "Gain 1 time in 1 board games.\n";
      }
      message += draw.getDaysThatNeverWere(smallDays);

      return msg.channel.send(message);
    } catch (e) {
      console.log(e);
      return msg.channel.send(e.toString());
    }
  },
};
