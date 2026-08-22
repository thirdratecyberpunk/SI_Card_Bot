const { getCardName } = require("./sendCardLink.js");
const { spirits } = require("./spiritNames.js");
const levenshtein = require("js-levenshtein");

const allAspects = buildAspectList(spirits);
const aspectByName = buildAspectByNameMap(allAspects); // exact name -> aspectObj
const aspectByEmote = buildAspectByEmoteMap(allAspects); // emote -> aspectObj

module.exports = {
  name: "aspect",
  description: "Shows cards for a given aspect (by name or emoji).",
  usage: "(aspect name|emoji) [card number]",
  details:
    "Looks up a spirit Aspect by name or emoji and returns its card panel image(s). If the aspect has multiple panels (e.g. a two-part Locus card) and no card number is given, all of them are sent; give a number to send just one. Use -aspects to see which aspects a given spirit has.",
  public: true,
  execute(msg, args) {
    if (!args || args.length === 0) {
      return msg.channel.send(
        "Usage: aspect <aspect name|emoji> [card number] (use -aspects for a list of a spirit's aspects)",
      );
    }

    // extract optional trailing number
    let requestedIndex;
    const last = args[args.length - 1];
    if (!isNaN(last) && last !== "") {
      requestedIndex = parseInt(args.pop(), 10);
    }

    const query = args.join(" ").trim();
    if (!query)
      return msg.channel.send(
        "Usage: aspect <aspect name|emoji> [card number] (use -aspects for a list of a spirit's aspects)",
      );

    // emoji query
    if (isEmojiQuery(query)) {
      const aspectObj = aspectByEmote[query];
      if (!aspectObj) return msg.channel.send("Aspect could not be found");
      return sendAspectPanel(msg, aspectObj.panel, requestedIndex);
    }

    const normalized = query.toLowerCase();

    // exact name lookup
    if (aspectByName[normalized]) {
      return sendAspectPanel(
        msg,
        aspectByName[normalized].panel,
        requestedIndex,
      );
    }

    // fuzzy search across aspect names (find best single match)
    const best = findClosestAspect(normalized, allAspects);
    if (best) {
      return sendAspectPanel(msg, best.panel, requestedIndex);
    }

    return msg.channel.send("Aspect could not be found");
  },
};

function buildAspectList(spiritsArray) {
  const list = [];
  for (const sp of spiritsArray || []) {
    if (!Array.isArray(sp.aspects)) continue;
    for (const a of sp.aspects) {
      // attach parent spirit title for context if needed
      list.push(Object.assign({ spiritTitle: sp.title || sp.name }, a));
    }
  }
  return list;
}

/**
 * Generates a map of all aspects that is queryable by names
 * @param {*} aspectList
 * @returns
 */
function buildAspectByNameMap(aspectList) {
  const map = {};
  for (const a of aspectList) {
    if (!a || !a.name) continue;
    map[a.name.toLowerCase()] = a;
  }
  return map;
}

/**
 * Generates a map of all aspects that is queryable by emojis
 * @param {*} aspectList
 * @returns
 */
function buildAspectByEmoteMap(aspectList) {
  const map = {};
  for (const a of aspectList) {
    if (!a || !a.emote) continue;
    map[a.emote] = a;
  }
  return map;
}

/**
 * Returns whether a given string is a discord emoji
 * @param {*} q
 * @returns
 */
function isEmojiQuery(q) {
  return /\p{Extended_Pictographic}/u.test(q) || q.charAt(0) === "<";
}

/**
 * Returns the closest aspect object via levenstein style search
 * @param {*} search
 * @param {*} aspectList
 * @returns
 */
function findClosestAspect(search, aspectList) {
  if (!search || !Array.isArray(aspectList) || aspectList.length === 0)
    return null;
  let best = null;
  let bestScore = Infinity;

  for (const a of aspectList) {
    if (!a.name) continue;
    const name = a.name.toLowerCase();
    // if name contains the search as substring prefer that (score 0)
    if (name.indexOf(search) !== -1) {
      return a;
    }
    // else compute levenshtein on same-length substrings as before
    const lenDiff = name.length - search.length;
    if (lenDiff >= 0) {
      for (let i = 0; i <= lenDiff; i++) {
        const sub = name.substring(i, i + search.length);
        const dist = levenshtein(sub, search);
        if (dist < bestScore) {
          bestScore = dist;
          best = a;
        }
      }
    } else {
      // search longer than name: compare whole name
      const dist = levenshtein(name, search);
      if (dist < bestScore) {
        bestScore = dist;
        best = a;
      }
    }
  }

  // threshold: avoid returning very distant matches
  const MAX_ACCEPTABLE_DISTANCE = Math.max(1, Math.floor(search.length / 2));
  return best && bestScore <= MAX_ACCEPTABLE_DISTANCE ? best : null;
}

function sendAspectPanel(msg, panel, index) {
  if (!Array.isArray(panel)) {
    return msg.channel.send(panel);
  }

  // if a valid index was supplied, send only that panel
  if (index && !isNaN(index) && index >= 1 && index <= panel.length) {
    return msg.channel.send(panel[index - 1]);
  }

  // otherwise send all panels in order
  for (const p of panel) {
    msg.channel.send(p);
  }
}
