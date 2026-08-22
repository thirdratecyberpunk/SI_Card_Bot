const { scenario } = require("./scenarioNames.js");

const adversary = require("./AdversaryNames.js").ad;
const spirits = require("./spiritNames.js").spirits;
const regularBoards = require("./boardNames.js").regularBoards;
const thematicBoards = require("./boardNames.js").thematicBoards;
const allBoards = require("./boardNames.js").allBoards;
const blight = require("./ImageNames.js").blight;

const complexities = require("./complexities.js").complexities;

const { combineDifficulty } = require("../utils/difficulty.js");

module.exports = {
  name: "random",
  description:
    "Get a random spirit, single/double adversary, board or scenario",
  usage:
    "spirit (max complexity (low/moderate/high/vhc))\n" +
    "adversary (min difficulty) (max difficulty)\n" +
    "double (min difficulty) (max difficulty)\n" +
    "scenario\n" +
    "board (all/thematic (defaults to regular))",
  details:
    "Picks a uniformly random result for the given category: a spirit (optionally capped by max complexity), a single adversary or double-adversary setup (optionally bounded by a difficulty range), a scenario, or a board (regular/thematic/all) - then sends its name plus artwork/panel link.",
  public: true,
  async execute(msg, args) {
    if (args[0]) {
      let command = args[0];
      switch (command) {
        case "spirit":
          // turning word definition into corresponding number (4 chooses from all spirits)
          let maxComplexity = complexities.has(args[1])
            ? complexities.get(args[1])
            : 4;
          answer = chooseSpirit(maxComplexity);
          await sendMessage(msg, answer);
          break;
        case "adversary":
          // checking if the user has passed a valid numerical input before passing to the adversary function
          var minDifficulty = parseInt(args[1]) ? parseInt(args[1]) : 0;
          var maxDifficulty = parseInt(args[2]) ? parseInt(args[2]) : 11;
          answer = chooseAdversary(minDifficulty, maxDifficulty);
          await sendMessage(msg, answer);
          break;
        case "double":
          // checking if the user has passed a valid numerical input before passing to the adversary function
          var minDifficulty = parseInt(args[1]) ? parseInt(args[1]) : 1;
          var maxDifficulty = parseInt(args[2]) ? parseInt(args[2]) : 11;
          answer = chooseDoubleAdversary(minDifficulty, maxDifficulty);
          await sendMessage(msg, answer);
          break;
        case "scenario":
          answer = chooseScenario();
          await sendMessage(msg, answer);
          break;
        case "board":
          // check if user has specified thematic or not
          let boardType = args[1] ? args[1] : "regular";
          answer = chooseBoard(boardType);
          await sendMessage(msg, answer);
          break;
        default:
          await msg.channel.send(
            "Do you want a random [spirit], [adversary], [double], [board] or [scenario]?",
          );
          break;
      }
    } else {
      await msg.channel.send(
        "Do you want a random [spirit], [adversary], [double], [board] or [scenario]?",
      );
    }
  },
};

/**
 * Sends two messages to the channel
 * @param {*} msg
 * @param {*} answer
 */
async function sendMessage(msg, answer) {
  let message = answer[0];
  if (answer.length > 2) {
    message = message + answer[2];
  }
  botMessage1 = await msg.channel.send(message);
  botMessage2 = await msg.channel.send(answer[1]);
}

/**
 * returns a spirit bounded by maximum complexity
 */
function chooseSpirit(maxComplexity = 4) {
  let validSpirits = spirits.filter(
    (spirit) => spirit.complexity <= maxComplexity,
  );
  let x = Math.floor(Math.random() * validSpirits.length);
  return [validSpirits[x].name, validSpirits[x].emote];
}

/**
 * returns an adversary within the given difficulty bounds
 * @param {int} minDifficulty
 * @param {int} maxDifficulty
 * @returns
 */
function chooseAdversary(minDifficulty = 0, maxDifficulty = 11) {
  if (
    maxDifficulty < minDifficulty ||
    maxDifficulty > 11 ||
    minDifficulty < 0
  ) {
    return [
      "For a single adversary, specify a difficulty range between 0 and 11.",
      "Difficulty should be specified as an integer greater or equal to 0 followed by an integer less than or equal to 11.",
    ];
  }

  // adversary is [name, escalation diff, diff 1 ...]
  var correct = true;
  let level = "";
  let n = 0;
  let keys = Array.from(adversary.keys());
  let name = adversary.get(keys[0]);

  while (correct) {
    name = adversary.get(keys[Math.floor(Math.random() * keys.length)]);
    n = Math.floor(Math.random() * 7);

    if (
      name.difficulty[n] >= minDifficulty &&
      name.difficulty[n] <= maxDifficulty
    ) {
      correct = false;
    }
  }

  if (n == 0) {
    level = "Base ";
  } else {
    level = n + " ";
  }

  let answer =
    name.name + " " + level + "(difficulty " + name.difficulty[n] + ")";
  return [answer, name.emote, ""];
}

/**
 * returns a double adversary within the given difficulty bounds
 * TODO: extract difficulty calculation logic into adversary class
 */
function chooseDoubleAdversary(minDifficulty = 1, maxDifficulty = 17) {
  if (
    maxDifficulty < minDifficulty ||
    maxDifficulty > 17 ||
    minDifficulty < 1 ||
    minDifficulty > 17 ||
    maxDifficulty === minDifficulty
  ) {
    return [
      "For a double adversary, specify a difficulty range between 1 and 17.",
      "Difficulty should be specified as an integer greater or equal to 1 and less than 17 followed by an integer less than or equal to 17.",
    ];
  }

  const candidates = buildDoubleAdversaryCandidates(
    minDifficulty,
    maxDifficulty,
  );

  if (candidates.length === 0) {
    return [
      `No double adversary combinations exist in the difficulty range ${minDifficulty}–${maxDifficulty}.`,
      "Try widening the range or lowering the minimum difficulty.",
    ];
  }

  const choice = candidates[Math.floor(Math.random() * candidates.length)];

  const answer =
    `LEADING: ${choice.leadingAdversary.name} ${choice.leadingLevel}\n` +
    `SUPPORTING: ${choice.supportingAdversary.name} ${choice.supportingLevel}\n` +
    `(difficulty (rounded) ${choice.totalDifficulty})`;

  return [
    answer,
    `${choice.leadingAdversary.emote}${choice.supportingAdversary.emote}`,
    "",
  ];
}

/**
 * returns a scenario
 * @param {*} selection
 * @param {*} min
 * @param {*} max
 * @returns
 */
function chooseScenario() {
  let s = Math.floor(Math.random() * scenario.length);
  return [scenario[s].name, scenario[s].linkBack];
}

/**
 * returns a blight card
 * @param {*} selection
 * @param {*} min
 * @param {*} max
 * @returns
 */
function chooseBlightCard() {
  let s = Math.floor(Math.random() * blight.length);
  return blight[s];
}

/**
 * returns a random board
 * @param {*} selection
 * @param {*} min
 * @param {*} max
 * @returns
 */
function chooseBoard(boardType = "regular") {
  let board;
  if (boardType == "all") {
    board = allBoards;
  } else if (boardType == "thematic") {
    board = thematicBoards;
  } else {
    board = regularBoards;
  }
  console.log(board);
  console.log(board.length);
  let s = Math.floor(Math.random() * board.length);
  console.log(s);
  console.log(board[s].name, board[s].link);
  return [board[s].name, board[s].link];
}

/**
 * Precomputes a range of valid adversary combinations that meet a given difficulty range
 * @param {*} minDifficulty
 * @param {*} maxDifficulty
 * @returns
 */
function buildDoubleAdversaryCandidates(minDifficulty, maxDifficulty) {
  const candidates = [];
  const adversaries = Array.from(adversary.values()); // Discord.Collection → array of adversary objects

  for (const lead of adversaries) {
    for (let leadLevel = 0; leadLevel < lead.difficulty.length; leadLevel++) {
      const leadDiff = lead.difficulty[leadLevel];

      for (const supp of adversaries) {
        if (supp === lead) continue; // no doubles of same adversary

        for (
          let suppLevel = 0;
          suppLevel < supp.difficulty.length;
          suppLevel++
        ) {
          const suppDiff = supp.difficulty[suppLevel];

          const total = combineDifficulty(leadDiff, suppDiff);

          if (total >= minDifficulty && total <= maxDifficulty) {
            candidates.push({
              leadingAdversary: lead,
              leadingLevel: leadLevel,
              leadingDifficulty: leadDiff,
              supportingAdversary: supp,
              supportingLevel: suppLevel,
              supportingDifficulty: suppDiff,
              totalDifficulty: total,
            });
          }
        }
      }
    }
  }
  return candidates;
}
