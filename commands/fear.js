const s = require("./sendCardLink");
const ImageNames = require("./ImageNames.js");

module.exports = {
  name: "fear",
  description: "Fear card search",
  usage: "[fear name]",
  details: "Looks up a Fear card by name and returns its SICK card image link.",
  public: true,

  async execute(msg, args) {
    await msg.channel.send(
      s.sendCardLink(
        msg,
        args,
        ImageNames.fear,
        "https://sick.oberien.de/imgs/fears/",
      ),
    );
  },
};
