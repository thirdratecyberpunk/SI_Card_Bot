const s = require("./sendCardLink.js");
const ImageNames = require("./ImageNames.js");

module.exports = {
  name: "event",
  description: "Event Search",
  usage: "[event name]",
  details:
    "Looks up an Event card by name and returns its SICK card image link. Some events share an alias; if a name is ambiguous the bot asks you to be more specific instead of guessing.",
  public: true,
  async execute(msg, args) {
    await msg.channel.send(
      s.sendCardLink(
        msg,
        args,
        ImageNames.event,
        "https://sick.oberien.de/imgs/events/",
        ImageNames.eventAliases,
      ),
    );
  },
};
