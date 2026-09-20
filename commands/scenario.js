// can be used as template
//save as command as commandName.js

const getCardName = require("./sendCardLink.js").getCardName;
const to = require("await-to-js").default;
const scenario = require("./scenarioNames.js").scenario;
const scenarioChoices = require("./scenarioNames.js").scenarioChoices;

module.exports = {
  name: "scenario",
  description: "Gets the front or back panel for a given scenario",
  details:
    "Returns a scenario's panel image - the back (its rules side) by default, or the front via the `side` option.",
  public: true, //has to be true to show as a command
  options: [
    {
      name: "scenario",
      description: "Which scenario to show",
      type: "string",
      required: true,
      choices: scenarioChoices,
    },
    {
      name: "side",
      description: "Which side of the panel (defaults to back)",
      type: "string",
      choices: [
        { name: "Front", value: "front" },
        { name: "Back", value: "back" },
      ],
    },
  ],
  async execute(msg, args) {
    var panel = "";
    var names = [];
    var side = "";

    scenario.forEach(function (s) {
      names.push(s.name);
    });

    // if no arguments, return a list of all scenarios
    if (args.length == 0) {
      msg.channel.send("Scenarios are: \n" + names.join(", "));
      return;
    }

    // pull the side out of wherever it sits in the args (it's a named
    // option now, so it's no longer guaranteed to come first); default to
    // the back, which is the side with the scenario's rules on it
    const sideIndex = args.findIndex((a) => a == "back" || a == "front");
    side = sideIndex >= 0 ? args.splice(sideIndex, 1)[0] : "back";

    // an exact name comes straight from the command's own choice list;
    // anything else falls back to the closest match
    const remaining = args.join(" ").trim();
    panel = names.includes(remaining) ? remaining : getCardName(args, names);

    scenario.forEach(function (s) {
      if (s.name == panel) {
        if (side == "front") {
          msg.channel.send(s.link);
        } else {
          msg.channel.send(s.linkBack);
        }
      }
    });
  },
};
