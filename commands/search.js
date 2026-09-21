const to = require("await-to-js").default;

var sHelp =
  'Examples: \
    \n Gather Dahan, \
    \n "Dahan and" major elements:plant \
    \n elements: earth fire \
    \n "add 1 presence", \
    \n range:sacred range:>=2 cost:<5 target:!any';

module.exports = {
  name: "search",
  description: "search the SICK library",
  details:
    "Builds a link to search sick.oberien.de's card catalog for the given words (spaces become %20 in the URL). Run `/search query:help` to see the supported query syntax - quoted phrases, and filters like `elements:`, `range:`, `cost:` and `target:`. Set the `spoiler` option to have the bot send the result as a blurred, click-to-reveal spoiler.",
  public: true,
  spoilerable: true,
  options: [
    {
      name: "query",
      description: "Search terms; run with 'help' for the query syntax",
      type: "string",
      required: true,
    },
  ],
  async execute(msg, args) {
    if (args[0] == "help") {
      return await msg.channel.send(sHelp);
    }

    const query = args.join(" ").trim();
    var site_name =
      "https://sick.oberien.de/?query=" + query.replace(/\s+/g, "%20");
    //var url = await UrlExists(site_name);
    //console.log(url);
    //if (url){
    await msg.channel.send(site_name);
    //}
    // else{
    //     msg.channel.send("Incorrect Syntax, try !search help");
    // }
  },
};

//async is not working
async function UrlExists(url) {
  var exsist = false;
  var status = await to(
    fetch(url).then(function (response) {
      console.log(response.headers.get("Content-Type"));
      if (response.ok) {
        console.log("True, web page is up");
        exsist = true;
      }
      if (!response.ok) {
        console.log("false, 404");
      }

      return new Promise(exsist);
    }),
  );
}
