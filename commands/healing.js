/**
 * command to retrieve one of the healing cards for WWB
 */

const heal = require("./healingNames.js");
const s = require("./sendCardLink.js");

function getSide(arg, f) {
  if (arg == "back" || arg == "front") {
    return f();
  }
}

function getPanel(hc, side) {
  return side == "front" ? hc.front : hc.back;
}

module.exports = {
  name: "healing",
  description: "Get a healing card",
  usage: "[keyword] (front/back)",
  details:
    "Looks up a Wounded Waters Bleeding healing card (roiling, serene, renew or ruin) by title and returns its panel image - front by default, or back if 'front'/'back' is given.",
  public: true,
  async execute(msg, args) {
    var panel = "Choose a healing card (roiling, serene, renew or ruin).";
    var found = false;

    if (args.length > 0) {
      // if there's no side provided, assume they want the useful side
      const side =
        (args.length > 1
          ? getSide(args[0], () => {
              return args.shift();
            }) ||
            getSide(args[args.length - 1], () => {
              return args.pop();
            })
          : undefined) || "front";
      var healingNames = [];
      const searchString = args.join(" ").toLowerCase();
      for (const hc of heal.healing) {
        healingNames.push(hc.name);
        if (hc.title.toLowerCase().indexOf(searchString) >= 0) {
          // stops when the first exact match is found
          panel = getPanel(hc, side);
          found = true;
          break;
        }
      }
      if (!found) {
        let name = s.getCardName(searchString, healingNames);
        for (const hc of heal.healing) {
          if (hc.name == name) {
            panel = getPanel(hc, side);
            break;
          }
        }
      }
    }

    msg.channel.send(panel);
  },
};
