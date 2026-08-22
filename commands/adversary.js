const { ad } = require("./AdversaryNames.js");

module.exports = {
  name: "adversary",
  description: "Get a single adversary panel",
  usage: "(adversary name)",
  details:
    "Looks up an adversary by exact title or alias and returns its rules panel image. With no match (or no argument), lists every adversary with its title and aliases instead.",
  public: true,
  async execute(msg, args) {
    var panel = "";
    var found = false;
    var list = [];
    // TODO: migrate the logic for checking an invader panel by name/alias to separate class
    // to minimise duplication
    // if an adversary parameter is provided
    if (args.length != 0) {
      const searchString = args[0].toLowerCase();
      for (const [name, adversary] of ad) {
        // if there is a panel with that string in the title, return it
        // checks for exact title matches to avoid Prussia - Russia problem
        if (adversary.title.toLowerCase() == searchString) {
          panel = adversary.panel;
          found = true;
          break;
        }
        // alias
        else {
          for (const alias of adversary.alias) {
            if (alias.toLowerCase().indexOf(searchString) >= 0) {
              panel = adversary.panel;
              found = true;
              break;
            }
          }
        }
      }
    }
    // if no match found or no argument provided, assume they want a list of adversaries
    if ((args.length == 0) | !found) {
      panel = "Choose an adversary: \n";
      for (const [name, adversary] of ad) {
        panel +=
          "* " +
          adversary.name +
          " (" +
          adversary.title +
          ", " +
          adversary.alias.join(" , ") +
          ")\n";
      }
    }

    msg.channel.send(panel);
  },
};
