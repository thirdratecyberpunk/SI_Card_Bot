/**
 * Definition of all adversaries
 */

const Discord = require("discord.js");
const Deck = require("./Deck.js");
const InvaderDeckCard = require("./InvaderDeckCard.js");

// TODO: extract these definitions into file separate from helper utilities
var habsburgmining = {
  title: "habsburg_mining",
  name: "Habsburg Mining Expedition",
  flagImage: "images/flags/Habsburg_Mining_Expedition_Flag.png",
  emote: "<:FlagHabsburgMiningHME:1487249155834253553>",
  difficulty: [2, 3, 5, 6, 8, 9, 10],
  panel: "https://i.imgur.com/xzXF6vu.png",
  alias: [
    "<:FlagHabsburgMiningHME:1487249155834253553>",
    ":pick:",
    "hme",
    "saltburg",
    "mining-expedition",
    "mining",
  ],
  deckModification: {
    0: (d) => {
      return d;
    },
    1: (d) => {
      return d;
    },
    2: (d) => {
      return d;
    },
    3: (d) => {
      return d;
    },
    // Untapped Salt Deposits: 'Remove the Stage II 'Coastal Lands' card
    // before randomly choosing Stage II cards. Place the 'Salt Deposits' card in
    // place of the 2nd Stage II card.
    // THIS DOES NOT REMOVE THE COASTAL LANDS CARD FOR SCOTLAND DOUBLES
    4: (d) => {
      const indices = d.reduce((acc, card, index) => {
        // gets the indexes of all the non-adversary specific Stage II cards
        if (card.stage === 2 && card.stage == card.cardSymbol) {
          acc.push(index);
        }
        return acc;
      }, []);
      // replaces the 2nd non adversary specific Stage II card with a Salt Deposits card
      d[indices[1]] = new InvaderDeckCard(2, "S");
      return d;
    },
    5: (d) => {
      return d;
    },
    6: (d) => {
      return d;
    },
  },
  fearDeckModification: {
    0: [0, 0, 0],
    1: [0, 0, 0],
    2: [0, 0, 1],
    3: [0, 1, 1],
    4: [1, 1, 1],
    5: [1, 2, 1],
    6: [1, 2, 1],
  },
  lossCondition: {
    name: "Land Stripped Bare",
    effect:
      "At the end of the :SpeedFast: Phase, the Invaders win if any land has at least 8 total Invaders/:Blight: (combined).",
  },
  escalation: {
    name: "Mining Tunnels",
    effect:
      "After Advancing Invader Cards: On each board, Explore in 2 lands whose terrains don't match a Ravage or Build Card (no source required).",
  },
  rules: {
    1: {
      name: "Avarice Rewarded",
      type: ["ravage", "build"],
      effect:
        "When :Blight: added by a Ravage Action would cascade, instead Upgrade 1 :InvaderExplorer:/:InvaderTown: (before :Dahan: counterattack.)\
Ceaseless Mining: Lands with 3 or more Invaders are Mining lands. In Mining lands:\
• :TokenDisease: and modifiers to :TokenDisease: affect Ravage Actions as though they were Build Actions.\
• During the Build Step, Build Cards cause Ravage Actions (instead of Build Actions).",
      exceptions: [
        {
          with: { title: "england", minLevel: 3 },
          note: "This doesn't interact with England 3 (High Immigration).",
        },
      ],
    },
    2: {
      name: "Miners Come From Far and Wide",
      type: ["setup"],
      effect:
        "Setup: Add 1 :InvaderExplorer: in each land with no :Dahan:. Add 1 :TokenDisease: and 1 :InvaderCity: in the highest-numbered land with a :InvaderTown: Setup symbol.",
    },
    3: {
      name: "Mining Boom (I)",
      type: ["build"],
      effect:
        "After the Build Step, on each board: Choose a land with :InvaderExplorer:. Upgrade 1 :InvaderExplorer: there.",
    },
    4: {
      name: "Untapped Salt Deposits",
      type: ["setup"],
      effect:
        "Setup: Remove the Stage II 'Coastal Lands' card before randomly choosing Stage II cards. Place the 'Salt Deposits' card in place of the 2nd Stage II card.",
      exceptions: [
        {
          with: { title: "scotland", minLevel: 2 },
          note: "This doesn't stop Scotland 2 from specially placing the Coastal Lands ('C') card.",
        },
        {
          with: { title: "russia", minLevel: 5 },
          note: "This does stop the Coastal Lands ('C') card from being a Russia 5 Fear Bomb.",
        },
        {
          with: { title: "scotland", minLevel: 1 },
          note: "Player option (not yet in the official FAQ): you can choose to limit the Salt Deposits ('S') card the same way the Coastal Lands ('C') card is limited.",
        },
      ],
    },
    5: {
      name: "Mining Boom (II)",
      type: ["build"],
      // Supersedes rule 3 (Mining Boom (I)) rather than stacking with it.
      replaces: 3,
      effect:
        "Instead of Mining Boom (I), after the Build Step, on each board: Choose a land with :InvaderExplorer:. Build there, then Upgrade 1 :InvaderExplorer:. (Build normally in a Mining land.)",
    },
    6: {
      name: "The Empire Ascendant",
      type: ["setup", "explore"],
      effect:
        "Setup and During the Explore Step: On boards with 3 or fewer :Blight:: Add +1 :InvaderExplorer: in each land successfully explored. (Max. 2 lands per board per Explore Card.)",
    },
  },
};

var prussia = {
  title: "prussia",
  name: "The Kingdom of Brandenburg-Prussia",
  flagImage: "images/flags/Brand-Prussia_Flag.png",
  emote: "<:FlagBrandenburgPrussiaBP:1487249033104855253>",
  difficulty: [1, 2, 4, 6, 7, 9, 10],
  panel: "https://imgur.com/KdyfP3C",
  alias: ["<:FlagBrandenburgPrussiaBP:1487249033104855253>", "bp"],
  deckModification: {
    0: (d) => {
      return d;
    },
    1: (d) => {
      return d;
    },
    // “Move the bottom-most Stage III card just
    // below the bottom-most Stage I card.”
    2: (d) => {
      // find the index of the bottom most Stage III card
      const bottomStage3Index = d.findLastIndex((card) => card.stage === 3);
      // find the index of the bottom most Stage I card
      const bottomStage1Index = d.findLastIndex((card) => card.stage === 1);
      // pop the bottom most Stage III card off and move it to
      // the index of the bottom most Stage I card + 1
      if (bottomStage3Index == -1) {
        throw new Error("Stage III card not found, cannot apply Prussia 2");
      }
      const stage3Card = d.splice(bottomStage3Index, 1)[0];
      d.splice(bottomStage1Index + 1, 0, stage3Card);
      return d;
    },
    // remove an additional stage I card
    3: (d) => {
      const index = d.findIndex((card) => card.stage === 1);
      if (index != -1) {
        d.splice(index, 1);
      }
      return d;
    },
    // remove an additional stage II card
    4: (d) => {
      const index = d.findIndex((card) => card.stage === 2);
      if (index != -1) {
        d.splice(index, 1);
      }
      return d;
    },
    // remove an additional stage I card
    5: (d) => {
      const index = d.findIndex((card) => card.stage === 1);
      if (index != -1) {
        d.splice(index, 1);
      }
      return d;
    },
    // remove all stage I cards
    6: (d) => {
      let newarr = d.filter((a) => a.stage !== 1);
      return newarr;
    },
  },
  fearDeckModification: {
    0: [0, 0, 0],
    1: [0, 0, 0],
    2: [0, 0, 0],
    3: [0, 1, 0],
    4: [1, 1, 0],
    5: [1, 1, 0],
    6: [1, 1, 1],
  },
  lossCondition: null,
  escalation: {
    name: "Land Rush",
    effect:
      "On each board with :InvaderTown:/:InvaderCity:, add 1 :InvaderTown: to a land without :InvaderTown:.",
  },
  rules: {
    1: {
      name: "Fast Start",
      type: ["setup"],
      effect: "During Setup, on each board add 1 :InvaderTown: to land #3.",
    },
    2: {
      name: "Surge of Colonists",
      type: ["setup"],
      effect:
        "When making the Invader Deck, put 1 of the Stage III cards between Stage I and Stage II.",
      exceptions: [
        {
          with: { any: true },
          note: "The early Stage III Card this creates still gets hit by a Stage III Escalation (from the Supporting Adversary) — Escalations care about what a card is, not what stage of the game it's currently in.",
        },
      ],
    },
    3: {
      name: "Efficient",
      type: ["setup"],
      effect:
        "When making the Invader Deck, remove an additional Stage I card.",
    },
    4: {
      name: "Aggressive Timetable",
      type: ["setup"],
      effect:
        "When making the Invader Deck, remove an additional Stage II card.",
    },
    5: {
      name: "Ruthlessly Efficient",
      type: ["setup"],
      effect:
        "When making the Invader Deck, remove an additional Stage I card.",
    },
    6: {
      name: "Terrifyingly Efficient",
      type: ["setup"],
      effect: "When making the Invader Deck, remove all Stage I cards.",
      exceptions: [
        {
          with: { any: true },
          note: "This can trigger a Stage III Escalation from the Supporting Adversary during Setup — e.g. even HME's Escalation, since it cares about cards advancing, not specifically the Advance Invader Cards step.",
        },
      ],
    },
  },
};

var england = {
  title: "england",
  name: "The Kingdom of England",
  flagImage: "images/flags/England_WrinkledFlag.png",
  emote: "<:FlagEngland:852366012175482900>",
  difficulty: [1, 3, 4, 6, 7, 9, 10],
  panel: "https://imgur.com/c5KzcIq",
  alias: ["<:FlagEngland:852366012175482900>", "🏴󠁧󠁢󠁥󠁮󠁧󠁿"],
  deckModification: {
    0: (d) => {
      return d;
    },
    1: (d) => {
      return d;
    },
    2: (d) => {
      return d;
    },
    3: (d) => {
      return d;
    },
    4: (d) => {
      return d;
    },
    5: (d) => {
      return d;
    },
    6: (d) => {
      return d;
    },
  },
  fearDeckModification: {
    0: [0, 0, 0],
    1: [0, 1, 0],
    2: [1, 1, 0],
    3: [1, 2, 1],
    4: [1, 2, 2],
    5: [1, 2, 2],
    6: [1, 2, 1],
  },
  lossCondition: {
    name: "Proud & Mighty Capital",
    effect:
      "If 7 or more :InvaderTown:/:InvaderCity: are ever in a single land, the Invaders win.",
  },
  escalation: {
    name: "Building Boom",
    effect:
      "On each board with :InvaderTown:/:InvaderCity:, Build in the land with the most :InvaderTown:/:InvaderCity:.",
  },
  rules: {
    1: {
      name: "Indentured Servants Earn Land",
      type: ["build"],
      effect:
        "Invader Build Cards affect matching lands without Invaders if they are adjacent to at least 2 :InvaderTown:/:InvaderCity:s.",
    },
    2: {
      name: "Criminals and Malcontents",
      type: ["setup"],
      effect:
        "During Setup, on each board add 1 :InvaderCity: to land #1 and 1 :InvaderTown: to land #2.",
    },
    3: {
      name: "High Immigration (I)",
      type: ["build"],
      effect:
        'Put the "High Immigration" tile on the Invader board, to the left of "Ravage". The Invaders take this Build action each Invader phase before Ravaging. Cards slide left from Ravage to it, and from it to the discard pile. Remove the tile when a Stage II card slides onto it, putting that card in the discard.',
    },
    4: {
      name: "High Immigration (full)",
      type: ["build"],
      // Supersedes rule 3 (High Immigration (I)); the tile no longer gets
      // removed, so the original wording no longer applies.
      replaces: 3,
      effect: "The extra Build tile remains out the entire game.",
    },
    5: {
      name: "Local Autonomy",
      type: ["ongoing"],
      effect: ":InvaderTown:/:InvaderCity: have +1 Health.",
    },
    6: {
      name: "Independent Resolve",
      type: ["setup", "build"],
      effect:
        "During Setup, add an additional 1 :TokenFear: to the Fear Pool per player in the game. During any Invader Phase where you resolve no Fear Cards, perform the Build from High Immigration twice. (This has no effect if no card is on the extra Build slot.)",
    },
  },
};

var france = {
  title: "france",
  name: "The Kingdom of France",
  flagImage: "images/flags/France_(Plantation_Colony)_WrinkledFlag.png",
  emote: "<:FlagFrance:852366013243981885>",
  difficulty: [2, 3, 5, 7, 8, 9, 10],
  panel: "https://imgur.com/S8lL3cA",
  alias: ["<:FlagFrance:852366013243981885>", "🇫🇷"],
  deckModification: {
    0: (d) => {
      return d;
    },
    1: (d) => {
      return d;
    },
    2: (d) => {
      return d;
    },
    3: (d) => {
      return d;
    },
    4: (d) => {
      return d;
    },
    5: (d) => {
      return d;
    },
    6: (d) => {
      return d;
    },
  },
  fearDeckModification: {
    0: [0, 0, 0],
    1: [0, 0, 0],
    2: [0, 1, 0],
    3: [1, 1, 0],
    4: [1, 1, 1],
    5: [1, 2, 1],
    6: [1, 2, 2],
  },
  lossCondition: {
    name: "Sprawling Plantations",
    effect:
      "Before Setup, return all but 7 :InvaderTown: per player to the box. Invaders win if you ever cannot place a :InvaderTown:.",
  },
  // TODO: need to handle Stage III escalation effects
  escalation: {
    name: "Demand for New Cash Crops",
    effect:
      "After Exploring, on each board, pick a land of the shown terrain. If it has :InvaderTown:/:InvaderCity:, add 1 :Blight:. Otherwise, add 1 :InvaderTown:. Randomly choose one of the land types shown on the card for Stage III escalations.",
  },
  rules: {
    1: {
      name: "Frontier Explorers",
      type: ["explore"],
      effect:
        "Except during Setup: After Invaders successfully Explore into a land which had no :InvaderTown:/:InvaderCity:, add 1 :InvaderExplorer: there.",
    },
    2: {
      name: "Slave Labor",
      type: ["setup", "build"],
      effect:
        'During Setup, put the "Slave Rebellion" event under the top 3 cards of the Event Deck. After Invaders Build in a land with 2 :InvaderExplorer: or more, replace all but 1 :InvaderExplorer: there with an equal number of :InvaderTown:.',
    },
    3: {
      name: "Early Plantation",
      type: ["setup"],
      effect:
        "During Setup, on each board add 1 :InvaderTown: to the highest-numbered land without :InvaderTown:. Add 1 :InvaderTown: to land #1.",
      exceptions: [
        {
          with: { any: true },
          note: "For on-island Setup, place pieces for the Leading Adversary before the Supporting Adversary — on some boards, which lands already have :InvaderTown: when this resolves depends on that order.",
        },
      ],
    },
    4: {
      name: "Triangle Trade",
      type: ["build"],
      effect:
        "Whenever Invaders Build a Coastal :InvaderCity:, add 1 :InvaderTown: to the adjacent land with the fewest :InvaderTown:.",
    },
    5: {
      name: "Slow-Healing Ecosystem",
      type: ["ongoing"],
      effect:
        "When you remove :Blight: from the board, put it here instead of onto the Blight Card. As soon as you have 3 :Blight: per player here, move it all back to the Blight Card.",
    },
    6: {
      name: "Persistent Explorers",
      type: ["explore"],
      effect:
        "After resolving an Explore Card, on each board add 1 :InvaderExplorer: to a land without any. Fear Card effects never remove :InvaderExplorer:. If one would, you may instead Push that :InvaderExplorer:.",
    },
  },
  doublesNotes:
    "Increase the pool of available :InvaderTown: by 1 per player for each level of the other Adversary being played.",
};

var habsburg = {
  title: "habsburg_livestock",
  name: "The Habsburg Monarchy",
  flagImage:
    "images/flags/Habsburg_Monarchy_(Livestock_Colony)_WrinkledFlag.png",
  emote: "<:FlagHabsburgLivestockHLC:1487248949839528076>",
  difficulty: [2, 3, 5, 6, 8, 9, 10],
  panel: "https://imgur.com/GtptfDJ",
  alias: [
    "<:FlagHabsburgLivestockHLC:1487248949839528076>",
    "🐮",
    "monarchy",
    "hlc",
    "cowburg",
    "livestock-colony",
    "livestock",
    "habsburger",
  ],
  deckModification: {
    0: (d) => {
      return d;
    },
    1: (d) => {
      return d;
    },
    2: (d) => {
      return d;
    },
    3: (d) => {
      const index = d.findIndex((card) => card.stage === 1);
      if (index != -1) {
        d.splice(index, 1);
      }
      return d;
    },
    4: (d) => {
      return d;
    },
    // adds the reminder card to the deck as a 0 as it should never be removed by any
    // other adversary
    5: (d) => {
      // d.splice(5, 0, new InvaderDeckCard(0, "Wave of Immigration Reminder"));
      return d;
    },
    6: (d) => {
      return d;
    },
  },
  fearDeckModification: {
    0: [0, 0, 0],
    1: [0, 1, 0],
    2: [1, 2, -1],
    3: [1, 2, 0],
    4: [1, 2, 0],
    5: [1, 3, 0],
    6: [2, 3, 0],
  },
  lossCondition: {
    name: "Irreparable Damage",
    effect:
      "Track how many :Blight: come off the :Blight: Card during Ravages that do 8+ Damage to the land. If that number ever exceeds players, the Invaders win.",
  },
  escalation: {
    name: "Seek Prime Territory",
    effect:
      "After the Explore Step: On each board with 4 or fewer :Blight:, add 1 :InvaderTown: to a land without :InvaderTown:/:Blight:. On each board with 2 or fewer :Blight:, do so again.",
  },
  rules: {
    1: {
      name: "Migratory Herders",
      type: ["build"],
      effect:
        "After the normal Build Step: In each land matching a Build Card, Gather 1 :InvaderTown: from a land not matching a Build Card. (In board/land order.)",
      exceptions: [
        {
          with: { title: "england", minLevel: 3 },
          note: "RAI, only check the Build Cards in the Build Space — not High Immigration.",
        },
        {
          with: { title: "habsburg_mining", minLevel: 3 },
          note: "This and HME's Mining Boom (level 3+) happen in an order of player choice.",
        },
        {
          with: { title: "habsburg_mining", minLevel: 4 },
          note: "Against HME 4's Salt Deposits card: which lands are gathered into is locked in before any gathering happens, but which lands can be gathered from is checked as you go.",
        },
      ],
    },
    2: {
      name: "More Rural Than Urban",
      type: ["setup", "build"],
      effect:
        "During Setup, on each board, add 1 :InvaderTown: to land #2 and 1 :InvaderTown: to the highest-numbered land without Setup symbols. During Play, when Invaders would Build 1 :InvaderCity: in an Inland land, they instead Build 2 :InvaderTown:.",
    },
    3: {
      name: "Fast Spread",
      type: ["setup"],
      effect:
        "When making the Invader Deck, Remove 1 additional Stage I Card. ",
    },
    4: {
      name: "Herds Thrive in Verdant Lands",
      type: ["ongoing"],
      effect:
        ':InvaderTown: in lands without :Blight: are Durable: they have +2 Health, and "Destroy :InvaderTown:" effects instead deal 2 Damage (to those :InvaderTown: only) per :InvaderTown: they could Destroy. ("Destroy all :InvaderTown:" works normally.)',
    },
    5: {
      name: "Wave of Immigration",
      type: ["setup"],
      effect:
        "Before the initial Explore, put the Habsburg Reminder Card under the top 5 Invader Cards. When Revealed, on each board, add 1 :InvaderCity: to a Coastal land without :InvaderCity: and 1 :InvaderTown: to the 3 Inland lands with the fewest :Blight:.",
      exceptions: [
        {
          with: { title: "habsburg_mining", minLevel: 0 },
          note: "This happens before HME's Escalation (Mining Tunnels).",
        },
      ],
    },
    6: {
      name: "Far-Flung Herds",
      type: ["ravage"],
      effect:
        "Ravages do +2 Damage (total) if any adjacent lands have :InvaderTown:. (This does not cause lands without Invaders to Ravage.)",
    },
  },
};

var russia = {
  title: "russia",
  name: "The Tsardom of Russia",
  flagImage: "images/flags/Russia_WrinkledFlag.png",
  emote: "<:FlagRussia:852366012639739945>",
  difficulty: [1, 3, 4, 6, 7, 9, 11],
  panel: "https://imgur.com/n16FmcP",
  alias: ["<:FlagRussia:852366012639739945>", "🇷🇺"],
  deckModification: {
    0: (d) => {
      return d;
    },
    1: (d) => {
      return d;
    },
    2: (d) => {
      return d;
    },
    3: (d) => {
      return d;
    },
    // Accelerated Exploitation: When making the Invader Deck, put 1 Stage III
    // card after each Stage II card
    4: (d) => {
      const indices = d.reduce((acc, card, index) => {
        if (card.stage === 2) {
          acc.push(index);
        }
        return acc;
      }, []);
      indices.reverse().forEach((index) => {
        d.splice(index + 1, 0, d.pop());
        if (d[d.length - 1].stage !== 3) {
          throw new Error("Bad 3 wasn't found");
        }
      });
      return d;
    },
    5: (d) => {
      return d;
    },
    6: (d) => {
      return d;
    },
  },
  fearDeckModification: {
    0: [0, 0, 0],
    1: [0, 0, 1],
    2: [1, 0, 1],
    3: [1, 1, 0],
    4: [1, 1, 1],
    5: [1, 2, 1],
    6: [2, 2, 1],
  },
  lossCondition: {
    name: "Hunters Swarm the Island",
    effect:
      "Put :TokenBeasts: Destroyed by Adversary rules on this panel. If there are ever more :TokenBeasts: on this panel than on the island, the Invaders win.",
  },
  escalation: {
    name: "Stalk the Predators",
    effect:
      "On each board: Add 2 :InvaderExplorer: (total) among lands with :TokenBeasts:s. If you can't, instead add 2 :InvaderExplorer: among lands with :TokenBeasts: on a different board.",
  },
  rules: {
    1: {
      name: "Hunters Bring Home Shell and Hide",
      type: ["setup", "ravage"],
      effect:
        "During Setup, on each board, add 1 :TokenBeasts: and 1 :InvaderExplorer: to the highest-numbered land without :InvaderTown:/:InvaderCity:. During Play, :InvaderExplorer: do +1 Damage. When Ravage adds :Blight: to a land (including cascades), Destroy 1 :TokenBeasts: in that land.",
      exceptions: [
        {
          with: { any: true },
          note: "For on-island Setup, place pieces for the Leading Adversary before the Supporting Adversary — on some boards, which lands already have :InvaderTown:/:InvaderCity: when this resolves depends on that order.",
        },
      ],
    },
    2: {
      name: "A Sense for Impending Disaster",
      type: ["ongoing"],
      effect:
        "The first time each Action would Destroy :InvaderExplorer:: If possible, 1 of those :InvaderExplorer: is instead Pushed; 1 :TokenFear: when you do so.",
    },
    3: {
      name: "Competition Among Hunters",
      type: ["ravage"],
      effect:
        "Ravage Cards also match lands with 3 or more :InvaderExplorer:. (If the land already matched the Ravage Card, it still Ravages just once.)",
    },
    4: {
      name: "Accelerated Exploitation",
      type: ["setup"],
      effect:
        "When making the Invader Deck, put 1 Stage III Card after each Stage II Card. ",
    },
    5: {
      name: "Entrench in the Face of Fear",
      type: ["setup"],
      effect:
        "Put an unused Stage II Invader Card under the top 3 Fear Cards, and an unused Stage III Card under the top 7 Fear Cards. When one is revealed, immediately place it in the Build space (face-up).",
      exceptions: [
        {
          with: { title: "england", minLevel: 1 },
          note: "The Fear Cards placed by this resolve separately and sequentially, so England 1 re-checks its condition for the second card.",
        },
        {
          with: { title: "scotland", minLevel: 3 },
          note: "The Fear Cards placed by this resolve separately and sequentially, so Scotland 3 re-checks its condition for the second card.",
        },
      ],
    },
    6: {
      name: "Pressure for Fast Profit",
      type: ["ravage"],
      effect:
        "After the Ravage Step of turn 2+, on each board where it added no :Blight:: In the land with the most :InvaderExplorer: (min. 1), add 1 :InvaderExplorer: and 1 :InvaderTown:.",
    },
  },
};

var scotland = {
  title: "scotland",
  name: "The Kingdom of Scotland",
  flagImage: "images/flags/Scotland_WrinkledFlag.png",
  emote: "<:FlagScotland:852366013621207040>",
  difficulty: [1, 3, 4, 6, 7, 8, 10],
  panel: "https://imgur.com/A5HccZx",
  alias: ["<:FlagScotland:852366013621207040>", "🏴󠁧󠁢󠁳󠁣󠁴󠁿"],
  deckModification: {
    0: (d) => {
      return d;
    },
    1: (d) => {
      return d;
    },
    2: (d) => {
      // gets the indexes of all stage II cards that aren't placed
      // by a specific adversary
      const indices = d.reduce((acc, card, index) => {
        if (card.stage === 2) {
          acc.push(index);
        }
        return acc;
      }, []);
      // replace the 3rd stage II card that ISN'T an adversary specific
      // card with Coastal card
      d[indices[2]] = new InvaderDeckCard(2, "C");
      // then, move the two Stage II cards above it up by one
      d.splice(indices[0] - 1, 0, d.splice(indices[0], 1)[0]);
      d.splice(indices[1] - 1, 0, d.splice(indices[1], 1)[0]);
      return d;
    },
    3: (d) => {
      return d;
    },
    4: (d) => {
      // replaces the last Stage I card with the bottom Stage III card
      const index = d.findLastIndex((card) => card.stage === 1);
      if (index !== -1) {
        const stage3index = d.findLastIndex((card) => card.stage === 3);
        if (stage3index > -1) {
          // replaces the last Stage I card with the last Stage III card
          d[index] = d.splice(stage3index, 1).shift();
        }
      }
      return d;
    },
    5: (d) => {
      return d;
    },
    6: (d) => {
      return d;
    },
  },
  fearDeckModification: {
    0: [0, 0, 0],
    1: [0, 1, 0],
    2: [1, 1, 0],
    3: [1, 2, 1],
    4: [2, 2, 1],
    5: [2, 3, 1],
    6: [3, 3, 1],
  },
  lossCondition: {
    name: "Trade Hub",
    // TODO: find a more elegant way of mentioning doubles exceptions
    effect:
      "If the number of Coastal lands with :InvaderCity: is ever greater than (2 x # of boards), the Invaders win.",
  },
  escalation: {
    name: "Ports Sprawl Outward",
    effect:
      "On the single board with the most Coastal :InvaderTown:/:InvaderCity:, add 1 :InvaderTown: to the N lands with the fewest :InvaderTown: (N = # of players.)",
  },
  rules: {
    1: {
      name: "Trading Port",
      type: ["explore"],
      effect:
        'After Setup, in Coastal lands, Explore Cards add 1 :InvaderTown: instead of 1 :InvaderExplorer: . "Coastal Lands" Invader cards do this for maximum 2 lands per board.',
    },
    2: {
      name: "Seize Opportunity",
      type: ["setup"],
      effect:
        'During Setup, add 1 :InvaderCity: to land #2. Place "Coastal Lands" as the 3rd Stage II card, and move the two Stage II Cards above it up by one.',
    },
    3: {
      name: "Chart the Coastline",
      type: ["build"],
      effect:
        "In Coastal lands, Build Cards affect lands without Invaders, so long as there is an adjacent :InvaderCity:.",
    },
    4: {
      name: "Ambition of a Minor Nation",
      type: ["setup"],
      effect:
        "During Setup, replace the bottom Stage I Card with the bottom Stage III Card.",
    },
    5: {
      name: "Runoff and Bilgewater",
      type: ["ravage"],
      effect:
        "After a Ravage Action adds :Blight: to a Coastal Land, add 1 :Blight: to that board's Ocean (without cascading). Treat the Ocean as a Coastal Wetland for this rule and for :Blight: removal/movement.",
      exceptions: [
        {
          with: { title: "habsburg_mining", minLevel: 1 },
          note: "Contrary to what a lot of people think, this doesn't interact with HME 1.",
        },
        {
          with: { title: "habsburg_livestock", minLevel: 0 },
          note: "Contrary to what a lot of people think, this doesn't interact with HM-LC, regardless of level.",
        },
      ],
    },
    6: {
      name: "Exports Fuel Inward Growth",
      type: ["ravage"],
      effect:
        "After the Ravage step, add 1 :InvaderTown: to each Inland land that matches a Ravage card and is within 1 Range of :InvaderTown:/:InvaderCity:.",
    },
  },
  doublesNotes:
    "If the other Adversary's Setup instructions would add :InvaderCity: to a Coastal land other than land #2, instead add the :InvaderCity: to an adjacent Inland land.",
};

var sweden = {
  title: "sweden",
  name: "The Kingdom of Sweden",
  flagImage: "images/flags/Sweden_WrinkledFlag.png",
  emote: "<:FlagSweden:852366014434770963>",
  difficulty: [1, 2, 3, 5, 6, 7, 8],
  panel: "https://imgur.com/D6ZeLOV",
  alias: ["<:FlagSweden:852366014434770963>", "🇸🇪"],
  deckModification: {
    0: (d) => {
      return d;
    },
    1: (d) => {
      return d;
    },
    2: (d) => {
      return d;
    },
    3: (d) => {
      return d;
    },
    4: (d) => {
      return d;
    },
    5: (d) => {
      return d;
    },
    6: (d) => {
      return d;
    },
  },
  fearDeckModification: {
    0: [0, 0, 0],
    1: [0, 0, 0],
    2: [0, 1, 0],
    3: [0, 1, 0],
    4: [0, 1, 1],
    5: [1, 1, 1],
    6: [1, 1, 2],
  },
  lossCondition: null,
  escalation: {
    name: "Swayed by the Invaders",
    effect:
      "After Invaders Explore into each land this Phase, if that land has at least as many Invaders as :Dahan:, replace 1 :Dahan: with 1 :InvaderTown:. Randomly choose one of the land types shown on the card for Stage III escalations.",
    exceptions: [
      {
        with: { title: "russia", minLevel: 5 },
        note: "This only applies to the Explore Card it's on, so it doesn't do anything on a Russia 5 Fear Bomb.",
      },
      {
        with: { title: "france", minLevel: 6 },
        note: "This and France 6 (Persistent Explorers) trigger at the same time; the order is broken by player choice.",
      },
    ],
  },
  rules: {
    1: {
      name: "Heavy Mining",
      type: ["ravage"],
      effect:
        "If the Invaders do at least 6 Damage to the land during Ravage, add an extra :Blight:. The additional :Blight: does not destroy Presence or cause cascades.",
      exceptions: [
        {
          with: { title: "habsburg_livestock", minLevel: 0 },
          note: "Unlike Scotland 5, HM-LC (any level) does interact with this.",
        },
      ],
    },
    2: {
      name: "Population Pressure at Home",
      type: ["setup"],
      effect:
        "During Setup, on each board add 1 :InvaderCity: to land #4. On boards where land #4 starts with :Blight:, put that :Blight: in land #5 instead.",
    },
    3: {
      name: "Fine Steel for Tools and Guns",
      type: ["ongoing"],
      effect: ":InvaderTown: deal 3 Damage. :InvaderCity: deal 5 Damage.",
    },
    4: {
      name: "Royal Backing",
      type: ["setup"],
      effect:
        "During Setup, after adding all other Invaders, Accelerate the Invader Deck. On each board, add 1 :InvaderTown: to the land of that terrain with the fewest Invaders.",
      exceptions: [
        {
          with: { title: "prussia", minLevel: 5 },
          note: "This specifically Accelerates the Invader Deck, so it'll skip over Prussia's early Stage III Card — this only kicks in once Prussia is at level 5; the card isn't pulled early before that.",
        },
        {
          with: { any: true },
          note: "This specifically goes at the very end of Setup, regardless of whether Sweden is the Leading or Supporting Adversary.",
        },
      ],
    },
    5: {
      name: "Mining Rush",
      type: ["ravage"],
      effect:
        "When Ravaging adds at least 1 :Blight: to a land, also add 1 :InvaderTown: to an adjacent land without :InvaderTown:/:InvaderCity:. Cascading :Blight: does not cause this effect.",
    },
    6: {
      name: "Prospecting Outpost",
      type: ["setup"],
      effect:
        "During setup, on each board add 1 :InvaderTown: and 1 :Blight: to land #8. The :Blight: comes from the box, not the Blight Card.",
    },
  },
};

let ad = new Discord.Collection();

ad.set("prussia", prussia);
ad.set("england", england);
ad.set("france", france);
ad.set("habsburg", habsburg);
ad.set("russia", russia);
ad.set("scotland", scotland);
ad.set("sweden", sweden);
ad.set("habsburgmining", habsburgmining);

// Helper: find by token (exact title match first, then alias substring)
function findByToken(token) {
  if (!token) return null;
  const t = token.toLowerCase();
  // exact title match
  for (const [, a] of ad) {
    if ((a.title || "").toLowerCase() === t) return a;
  }
  // alias substring match
  for (const [, a] of ad) {
    if (!Array.isArray(a.alias)) continue;
    for (const alias of a.alias) {
      if (String(alias).toLowerCase().indexOf(t) >= 0) return a;
    }
  }
  return null;
}

// TODO: extract this helper into adversary parsing util
const isValidAdversaryLevel = (adversaryLevel) => {
  return !(isNaN(adversaryLevel) || adversaryLevel < 0 || adversaryLevel > 6);
};

/**
 * parseSetupArgs(args)
 * args: array (e.g. ["prussia","6"] or ["prussia","6","scotland","6"])
 * returns: { leadingAdversary, leadingLevel, supportingAdversary?, supportingLevel? }
 * throws Error on invalid input (caller should catch and report to user)
 * TODO: this should probably be middleware for the relevant Discord layer rather than in AdversaryNames
 * but to be honest the whole project layout needs rethinking if we want to expose the data via
 * API and not assume this is only for Discord
 */
function parseSetupArgs(args) {
  if (!Array.isArray(args)) throw new Error("Invalid arguments");
  if (args.length !== 2 && args.length !== 4) {
    throw new Error(
      "Please specify at least one adversary and a numeric level (-invaderdeck prussia 6) or (-invaderdeck prussia 6 scotland 6).",
    );
  }

  const leadToken = String(args[0]).toLowerCase();
  const leadingLevel = Number.parseInt(args[1]);
  if (!isValidAdversaryLevel(leadingLevel))
    throw new Error(
      "Please specify a numeric level between 0 and 6 for the leading adversary.",
    );

  const leadingAdversary = findByToken(leadToken);
  if (!leadingAdversary)
    throw new Error(
      "Leading adversary not found; try names or nicknames listed in -adversary.",
    );

  let supportingAdversary = null;
  let supportingLevel = null;
  if (args.length === 4) {
    const suppToken = String(args[2]).toLowerCase();
    supportingLevel = Number.parseInt(args[3]);
    if (!isValidAdversaryLevel(supportingLevel))
      throw new Error(
        "Please specify a numeric level between 0 and 6 for the supporting adversary.",
      );

    supportingAdversary = findByToken(suppToken);
    if (!supportingAdversary)
      throw new Error(
        "Supporting adversary not found; try names or nicknames listed in -adversary.",
      );

    if (supportingAdversary.name === leadingAdversary.name)
      throw new Error("Please specify two different adversaries.");
  }

  return {
    leadingAdversary: leadingAdversary,
    leadingLevel: leadingLevel,
    supportingAdversary: supportingAdversary,
    supportingLevel: supportingLevel,
  };
}

/**
 * Compute fear deck counts for given leading/supporting adversaries and levels.
 * Params:
 * - leadingAdversary: adversary object (required)
 * - leadingLevel: integer 0..6 (required)
 * - supportingAdversary: adversary object or null (optional)
 * - supportingLevel: integer 0..6 or null (optional)
 * Returns: array [stageI, stageII, stageIII]
 */
function computeFearDeck(
  leadingAdversary,
  leadingLevel,
  supportingAdversary = null,
  supportingLevel = null,
) {
  if (!leadingAdversary || typeof leadingLevel !== "number") {
    throw new Error("leadingAdversary and leadingLevel are required");
  }

  // base deck
  const base = [3, 3, 3];

  // get modification arrays (validate presence)
  const leadMod = leadingAdversary.fearDeckModification;
  if (!leadMod || !Array.isArray(leadMod[leadingLevel])) {
    throw new Error("Invalid fearDeckModification for leading adversary/level");
  }

  if (supportingAdversary) {
    const suppMod = supportingAdversary.fearDeckModification;
    if (!suppMod || !Array.isArray(suppMod[supportingLevel])) {
      throw new Error(
        "Invalid fearDeckModification for supporting adversary/level",
      );
    }
    return base.map(
      (v, i) => v + leadMod[leadingLevel][i] + suppMod[supportingLevel][i],
    );
  } else {
    return base.map((v, i) => v + leadMod[leadingLevel][i]);
  }
}

/**
 * Compute the invader deck for given leading/supporting adversaries and levels.
 * Params:
 * - leadingAdversary: adversary object (required)
 * - leadingLevel: integer 0..6 (required)
 * - supportingAdversary: adversary object or null (optional)
 * - supportingLevel: integer 0..6 or null (optional)
 * Returns: Deck instance (with .cards array of InvaderDeckCard)
 */
function computeInvaderDeck(
  leadingAdversary,
  leadingLevel,
  supportingAdversary = null,
  supportingLevel = null,
) {
  if (!leadingAdversary || typeof leadingLevel !== "number") {
    throw new Error("leadingAdversary and leadingLevel are required");
  }

  // Start with a fresh deck
  const deck = new Deck();

  // Apply supporting adversary first (if any)
  if (supportingAdversary) {
    for (let lvl = 0; lvl <= supportingLevel; lvl++) {
      if (supportingAdversary.deckModification[lvl]) {
        deck.cards = supportingAdversary.deckModification[lvl](deck.cards);
      }
    }
  }

  // Apply leading adversary second
  for (let lvl = 0; lvl <= leadingLevel; lvl++) {
    if (leadingAdversary.deckModification[lvl]) {
      deck.cards = leadingAdversary.deckModification[lvl](deck.cards);
    }
  }

  // Special-case: Habsburg Livestock reminder card (Level 5+)
  const needsHLCReminder =
    (supportingAdversary &&
      supportingAdversary.title === "habsburg_livestock" &&
      supportingLevel >= 5) ||
    (leadingAdversary &&
      leadingAdversary.title === "habsburg_livestock" &&
      leadingLevel >= 5);

  if (needsHLCReminder) {
    const reminder = new InvaderDeckCard(0, "Wave of Immigration Reminder");
    deck.cards.splice(5, 0, reminder);
  }

  return deck;
}

/**
 * Extract rules for an adversary up to a given difficulty level.
 * Returns array of { index, name, effect, type } sorted by index.
 * type is an array of phases the rule applies to, e.g. ["setup"] or
 * ["setup", "build"]; "ongoing" for passive/always-on or phase-agnostic rules.
 */
function getRulesForAdversary(adversary, maxLevel) {
  if (!adversary || !adversary.rules) return [];

  const applicableIndices = Object.keys(adversary.rules)
    .map(Number)
    .filter((i) => i <= maxLevel);

  // A rule can declare `replaces: <index>` to supersede an earlier rule
  // (e.g. England's "High Immigration (full)" replaces "High Immigration
  // (I)"). Once the replacing rule is active, hide the one it replaces.
  const replacedIndices = new Set(
    applicableIndices
      .map((i) => adversary.rules[i].replaces)
      .filter((r) => r !== undefined),
  );

  return applicableIndices
    .filter((i) => !replacedIndices.has(i))
    .sort((a, b) => a - b)
    .map((i) => ({
      index: i,
      name: adversary.rules[i].name,
      effect: adversary.rules[i].effect,
      type: adversary.rules[i].type ?? ["ongoing"],
      exceptions: adversary.rules[i].exceptions ?? [],
    }));
}

/**
 * Whether an exception's `with` condition is satisfied by the other
 * adversary in a doubles pairing. `{ any: true }` matches any partner at
 * all (used for exceptions that aren't about one specific adversary);
 * `{ title, minLevel }` matches a specific adversary at or above a level —
 * minLevel: 0 matches that adversary at any level, since every level is >= 0.
 */
function exceptionApplies(withCondition, partnerAdversary, partnerLevel) {
  if (!withCondition) return false;
  if (withCondition.any) return Boolean(partnerAdversary);
  if (!partnerAdversary) return false;
  return (
    partnerAdversary.title === withCondition.title &&
    partnerLevel >= withCondition.minLevel
  );
}

/**
 * Collects doubles-interaction notes ("exceptions") called out on the
 * currently active rules/escalations of both adversaries in a pairing.
 * Each note is anchored on whichever single rule/escalation it's actually
 * about, and declares which *other* adversary (and level) needs to be in
 * play for it to be relevant — so a note only surfaces when both halves of
 * the interaction it describes are actually on the table.
 * Returns [] for a solo (non-doubles) setup, since these are all pairwise.
 * Returns array of { source, note }, in leading-then-supporting rule order.
 */
function getDoublesNotes({
  leadingAdversary,
  leadingLevel,
  leadRules,
  supportingAdversary,
  supportingLevel,
  suppRules,
}) {
  if (!supportingAdversary) return [];

  const notes = [];

  const collect = (entries, partnerAdversary, partnerLevel) => {
    for (const entry of entries) {
      for (const exc of entry.exceptions ?? []) {
        if (exceptionApplies(exc.with, partnerAdversary, partnerLevel)) {
          notes.push({ source: entry.name, note: exc.note });
        }
      }
    }
  };

  collect(leadRules, supportingAdversary, supportingLevel);
  collect(suppRules, leadingAdversary, leadingLevel);
  collect(
    [
      {
        name: leadingAdversary.escalation?.name,
        exceptions: leadingAdversary.escalation?.exceptions,
      },
    ],
    supportingAdversary,
    supportingLevel,
  );
  collect(
    [
      {
        name: supportingAdversary.escalation?.name,
        exceptions: supportingAdversary.escalation?.exceptions,
      },
    ],
    leadingAdversary,
    leadingLevel,
  );

  return notes;
}

/**
 * Returns the loss condition for an adversary, scaling France's "Sprawling
 * Plantations" base pool size when played as part of a doubles game (per its
 * doublesNotes: at France Level 2+, +1 Town per player for each level of the
 * other Adversary). otherLevel is the other adversary's level, or
 * null/omitted when solo.
 */
function getLossCondition(adversary, level, otherLevel = null) {
  if (!adversary || !adversary.lossCondition) return null;

  const { name, effect } = adversary.lossCondition;

  if (
    adversary.title === "france" &&
    level >= 2 &&
    typeof otherLevel === "number"
  ) {
    const scaledPool = 7 + otherLevel;
    return {
      name,
      effect: effect.replace(/\b7\b/, String(scaledPool)),
    };
  }

  return adversary.lossCondition;
}

// Export registry and helpers
module.exports = {
  ad,
  findByToken,
  isValidAdversaryLevel,
  parseSetupArgs,
  computeFearDeck,
  computeInvaderDeck,
  getRulesForAdversary,
  getLossCondition,
  getDoublesNotes,
};
