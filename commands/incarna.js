// endpoint to retrieve an incarna
const inc = require("./incarnaNames.js");
const { incarnaChoices } = inc;
const getcardname = require("./sendCardLink.js").getCardName;

module.exports = {
  name: "incarna",
  description: "Get an incarna",
  details:
    "Returns a spirit's Incarna card panel image - the unempowered (front) side by default, or the empowered side via the `side` option.",
  public: true,
  options: [
    {
      name: "spirit",
      description: "Spirit whose incarna to show",
      type: "string",
      required: true,
      choices: incarnaChoices,
    },
    {
      name: "side",
      description: "Unempowered (front) or empowered (back); defaults to front",
      type: "string",
      choices: [
        { name: "Front", value: "front" },
        { name: "Back", value: "back" },
      ],
    },
  ],
  async execute(msg, args) {
    var panel = "Please name a spirit with an incarna.";
    var found = false;
    var list = [];

    if (args.length != 0) {
      const searchString = args[0].toLowerCase();
      // if there's no second argument provided, assume they want the unempowered side
      const side = args.length > 1 ? args[1] : "front";
      for (const incarna of inc.incarna) {
        // direct match
        if (incarna.name.toLowerCase().indexOf(searchString) >= 0) {
          panel = side == "front" ? incarna.front : incarna.back;
        }
        // alias
        else {
          for (const alias of incarna.alias) {
            if (alias.toLowerCase().indexOf(searchString) >= 0) {
              panel = side == "front" ? incarna.front : incarna.back;
            }
          }
        }
      }
    }

    msg.channel.send(panel);
  },
};
