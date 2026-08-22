// can be used as template
//save as command as commandName.js
const cards = require("./ImageNames.js");

module.exports = {
  name: "draw",
  description:
    "Draw up to 10 random cards. For only taking a single card, use -take instead.",
  usage: "[card type] [amount (<=10)]",
  details:
    "Draws a random sample of cards of the given type (minor, major, fear, event or blight) and lists their names. Defaults to 4 cards if no amount is given; amount must be an integer from 1 to 10. For a single card with a direct image link, use -take instead.",
  public: true, //has to be true to show as a command
  async execute(msg, args) {
    try {
      if (args.length < 1) {
        throw new Error(
          "Please specify a type of card to draw (minor, major, fear or event) (defaults to 4 cards drawn). For only taking a single card, use -take instead.",
        );
      }
      drawnType = args[0].toLowerCase();
      if (args.length > 1) {
        drawAmount = parseInt(args[1]);
        return msg.channel.send(getRandomDraws(drawnType, drawAmount));
      } else {
        return msg.channel.send(getRandomDraws(drawnType));
      }
    } catch (e) {
      console.log(e);
      return msg.channel.send(e.toString());
    }
  },
  getRandomDraws,
  capitalizeTheFirstLetterOfEachWord,
  getDaysThatNeverWere,
};

/**
 * Sends a message containing a list of drawAmount cards of drawnType
 * @param {*} drawnType
 * @param {*} drawAmount
 * @returns
 */
function getRandomDraws(drawnType, drawAmount = 4) {
  if (drawnType == null) {
    throw new Error(
      "Please specify a type of card to draw (minor, major, fear or event).",
    );
  }
  if (
    drawAmount == null ||
    !Number.isInteger(drawAmount) ||
    drawAmount < 1 ||
    drawAmount > 10
  ) {
    throw new Error(
      "Please specify a positive integer of cards to draw between 1 and 10.",
    );
  }

  let drawableCards = ["minor", "major", "fear", "event", "blight"];

  let list = [];
  length = 0;

  if (drawableCards.includes(drawnType)) {
    list = capitalizeTheFirstLetterOfEachWord(
      sampleFromArray(cards[drawnType], drawAmount),
    );
    console.log(list);
    if (Array.isArray(list)) {
      // if there is more than one card drawn, return the formatted message
      if (list.length > 1) {
        var message = "";
        for (const message_ind of list) {
          message += "\n* " + message_ind;
        }
        return message;
      }
      // otherwise, just return the first result
      else {
        return list[0];
      }
    } else {
      return list;
    }
  } else {
    throw new Error(
      "Please specify a type of card to draw (minor, major, fear, event, blight) (defaults to 4 cards drawn).",
    );
  }
}

/**
 * returns a formatted Days That Never Were list
 * @param {*} smallDays -> is the game less than 3 players?
 */
function getDaysThatNeverWere(smallDays = true) {
  let numToDraw = smallDays ? 6 : 4;
  let message = "Majors:";
  message += getRandomDraws("major", numToDraw);
  message += "\nMinors:";
  message += getRandomDraws("minor", numToDraw);
  return message;
}

/**
 * returns an array of n samples from the input array
 * @param {*} arr -> array to randomly sample from
 * @param {*} n -> number of samples returned
 * @returns
 */
function sampleFromArray(arr, n) {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len)
    throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

/**
 * returns a capitalised version of the input string
 * TODO: move this to a collection of other relevant string manipulation methods
 * TODO: change function to change A string rather than a collection
 * @param {*} list -> list of strings to format
 * @returns
 */
function capitalizeTheFirstLetterOfEachWord(list) {
  for (var i = 0; i < list.length; i++) {
    var separateWord = list[i].toLowerCase().split("_");
    for (var j = 0; j < separateWord.length; j++) {
      separateWord[j] =
        separateWord[j].charAt(0).toUpperCase() + separateWord[j].substring(1);
    }
    list[i] = separateWord.join(" ");
  }
  return list;
}
