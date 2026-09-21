const s = require("./sendCardLink.js");
const ImageNames = require("./ImageNames.js");

module.exports = {
  name: "event",
  description: "Event Search",
  details:
    "Looks up an Event card by name and returns its SICK card image link. Some events share an alias; if a name is ambiguous the bot asks you to be more specific instead of guessing. Set the `spoiler` option to have the bot send the result as a blurred, click-to-reveal spoiler.",
  public: true,
  spoilerable: true,
  options: [
    {
      name: "card",
      description: "Event card name",
      type: "string",
      required: true,
    },
  ],
  async execute(msg, args) {
    await s.sendCardLink(
      msg,
      args,
      ImageNames.event,
      "https://sick.oberien.de/imgs/events/",
      ImageNames.eventAliases,
    );
  },
};
