const levenshtein = require("js-levenshtein");
const draw = require("./draw.js");

function getCardName(input, availableNames, weightOfSizediff = 0.8) {
  var target = cleanInput(input);
  var perfectMatches = getPerfectMatch(target, availableNames);

  console.log(target, perfectMatches);

  if (perfectMatches.length === 1) {
    return perfectMatches[0];
  } else if (perfectMatches.length > 1) {
    return getCardNameHelper(target, perfectMatches, weightOfSizediff);
  } else {
    return getCardNameHelper(target, availableNames, weightOfSizediff);
  }
}

function getCardNameHelper(input, availableNames, weightOfSizediff) {
  var result = null;
  var closestDistance = 999;

  for (var name of availableNames) {
    var sizeDiff = name.length > input.length ? name.length - input.length : 0;
    var distance = levenshtein(input, name) - sizeDiff * weightOfSizediff;
    if (distance < closestDistance) {
      closestDistance = distance;
      result = name;
    }
  }
  return result;
}

function getPerfectMatch(input, availableNames) {
  var result = [];
  for (var name of availableNames) {
    if (name.includes(input)) {
      result.push(name);
    }
  }
  return result;
}

/**
 * Returns the SICK link given a card name
 * @param {*} msg
 * @param {*} input
 * @param {*} availableNames
 * @param {*} basePath
 * @param {*} aliases
 * @returns
 */
async function sendCardLink(
  msg,
  input,
  availableNames,
  basePath,
  aliases = {},
) {
  var cardName = getCardName(
    input,
    [].concat(availableNames).concat(Object.keys(aliases)),
  );
  if (cardName) {
    if (cardName in aliases) {
      if (typeof aliases[cardName] === "string") {
        cardName = aliases[cardName];
        // handling cases where event cards share an alias
      } else {
        const matches = draw.capitalizeTheFirstLetterOfEachWord(
          aliases[cardName],
        );
        var message = "Your search matched several cards, please specify:";
        message += matches.map((s) => "\n- " + s).join("");
        return await msg.channel.send(message);
      }
    }
    return await msg.channel.send(basePath + cardName + ".webp");
  } else {
    return await msg.channel.send("Incorrect name, try using /search");
  }
}

/**
 * Normalises a search term into the underscored form the card name lists
 * use (e.g. "Fields Choked with Growth" -> "fields_choked_with_growth").
 * Every separator is replaced, not just the first: a slash command hands
 * the whole name over as a single string, so a name with more than one
 * space has to survive this to ever match exactly.
 */
function cleanInput(args) {
  var card_name = args.toString().toLowerCase();
  return card_name.replace(/[-\']/g, "").replace(/[,\s]+/g, "_");
}

module.exports = {
  getCardName: getCardName,
  sendCardLink: sendCardLink,
};
