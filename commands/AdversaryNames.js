/**
 * Definition of all adversaries
 */

const Discord = require("discord.js");
const { InvaderDeckCard } = require("./deckCalc.js");

var habsburgmining = {
  title: "habsburg_mining",
  name: "Habsburg Mining Expedition",
  emote: "<:FlagHabsburgMining:1181395803479212103>",
  difficulty: [2, 3, 5, 6, 8, 9, 10],
  panel: "https://i.imgur.com/xzXF6vu.png",
  alias: [
    "<:FlagHabsburgMining:1181395803479212103>",
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
      effect:
        "When :Blight: added by a Ravage Action would cascade, instead Upgrade 1 :InvaderExplorer:/:InvaderTown: (before :Dahan: counterattack.)\
Ceaseless Mining: Lands with 3 or more Invaders are Mining lands. In Mining lands:\
• :TokenDisease: and modifiers to :TokenDisease: affect Ravage Actions as though they were Build Actions.\
• During the Build Step, Build Cards cause Ravage Actions (instead of Build Actions).",
    },
    2: {
      name: "Miners Come From Far and Wide",
      effect:
        "Setup: Add 1 :InvaderExplorer: in each land with no :Dahan:. Add 1 :TokenDisease: and 1 City in the highest-numbered land with a :InvaderTown: Setup symbol.",
    },
    3: {
      name: "Mining Boom (I)",
      effect:
        "After the Build Step, on each board: Choose a land with :InvaderExplorer:. Upgrade 1 :InvaderExplorer: there.",
    },
    4: {
      name: "Untapped Salt Deposits",
      effect:
        "Setup: Remove the Stage II 'Coastal Lands' card before randomly choosing Stage II cards. Place the 'Salt Deposits' card in place of the 2nd Stage II card.",
    },
    5: {
      name: "Mining Boom (II)",
      effect:
        "Instead of Mining Boom (I), after the Build Step, on each board: Choose a land with :InvaderExplorer:. Build there, then Upgrade 1 :InvaderExplorer:. (Build normally in a Mining land.)",
    },
    6: {
      name: "The Empire Ascendant",
      effect:
        "Setup and During the Explore Step: On boards with 3 or fewer :Blight:: Add +1 :InvaderExplorer: in each land successfully explored. (Max. 2 lands per board per Explore Card.)",
    },
  },
};

var prussia = {
  title: "prussia",
  name: "The Kingdom of Brandenburg-Prussia",
  emote: "<:FlagBrandenburgPrussia:852366012846309406>",
  difficulty: [1, 2, 4, 6, 7, 9, 10],
  panel: "https://imgur.com/KdyfP3C",
  alias: ["<:FlagBrandenburgPrussia:852366012846309406>", "bp"],
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
      // find the index of the bottom most stage 3 card
      const bottomStage3Index = d.findLastIndex((card) => card.stage === 3);
      // find the index of the bottom most stage 1 card
      const bottomStage1Index = d.findLastIndex((card) => card.stage === 1);
      // pop the bottom most stage 3 card off and move it to
      // the index of the bottom most stage 1 card + 1
      if (bottomStage3Index == -1) {
        throw new Error("Stage 3 card not found, cannot apply Prussia 2");
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
      effect: "During Setup, on each board add 1 :InvaderTown: to land #3.",
    },
    2: {
      name: "Surge of Colonists",
      effect:
        "When making the Invader Deck, put 1 of the Stage III cards between Stage I and Stage II.",
    },
    3: {
      name: "Efficient",
      effect:
        "When making the Invader Deck, remove an additional Stage I card.",
    },
    4: {
      name: "Aggressive Timetable",
      effect:
        "When making the Invader Deck, remove an additional Stage II card.",
    },
    5: {
      name: "Ruthlessly Efficient",
      effect:
        "When making the Invader Deck, remove an additional Stage I card.",
    },
    6: {
      name: "Terrifyingly Efficient",
      effect: "When making the Invader Deck, remove all Stage I cards.",
    },
  },
};

var england = {
  title: "england",
  name: "The Kingdom of England",
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
    name: "Land Rush",
    effect:
      "On each board with :InvaderTown:/:InvaderCity:, add 1 :InvaderTown: to a land without :InvaderTown:.",
  },
  rules: {
    1: {
      name: "Indentured Servants Earn Land",
      effect:
        "Invader Build Cards affect matching lands without Invaders if they are adjacent to at least 2 :InvaderTown:s.",
    },
    2: {
      name: "Criminals and Malcontents",
      effect:
        "During Setup, on each board add 1 :InvaderTown: to land #1 and 1 Town to land #2.",
    },
    3: {
      name: "High Immigration (I)",
      effect:
        'Put the "High Immigration" tile on the Invader board, to the left of "Ravage". The Invaders take this Build action each Invader phase before Ravaging. Cards slide left from Ravage to it, and from it to the discard pile. Remove the tile when a Stage II card slides onto it, putting that card in the discard.',
    },
    4: {
      name: "High Immigration (full)",
      effect: "The extra Build tile remains out the entire game.",
    },
    5: {
      name: "Local Autonomy",
      effect: ":InvaderTown:/:InvaderCity: have +1 Health.",
    },
    6: {
      name: "Independent Resolve",
      effect:
        "During Setup, add an additional 1 :TokenFear: to the Fear Pool per player in the game. During any Invader Phase where you resolve no Fear Cards, perform the Build from High Immigration twice. (This has no effect if no card is on the extra Build slot.)",
    },
  },
};

var france = {
  title: "france",
  name: "The Kingdom of France",
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
  // TODO: France's loss con is variable, will need to template this
  lossCondition: {
    name: "Sprawling Plantations",
    effect:
      "Before Setup, return all but 7 :InvaderTown: per player to the box. Invaders win if you ever cannot place a :InvaderTown:.",
  },
  // TODO: need to handle stage 3 escalation effects
  escalation: {
    name: "Demand for New Cash Crops",
    effect:
      "After Exploring, on each board, pick a land of the shown terrain. If it has :InvaderTown:/:InvaderCity:, add 1 :Blight:. Otherwise, add 1 :InvaderTown:.",
  },
  rules: {
    1: {
      name: "Frontier Explorers",
      effect:
        "Except during Setup: After Invaders successfully Explore into a land which had no :InvaderTown:/:InvaderCity:, add 1 :InvaderExplorer: there.",
    },
    2: {
      name: "Slave Labor",
      effect:
        'During Setup, put the "Slave Rebellion" event under the top 3 cards of the Event Deck. After Invaders Build in a land with 2 :InvaderExplorer: or more, replace all but 1 :InvaderExplorer: there with an equal number of :InvaderTown:.',
    },
    3: {
      name: "Early Plantation",
      effect:
        "During Setup, on each board add 1 :InvaderTown: to the highest-numbered land without :InvaderTown:. Add 1 :InvaderTown: to land #1.",
    },
    4: {
      name: "Triangle Trade",
      effect:
        "Whenever Invaders Build a Coastal :InvaderCity:, add 1 :InvaderTown: to the adjacent land with the fewest :InvaderTown:.",
    },
    5: {
      name: "Slow-Healing Ecosystem",
      effect:
        "When you remove :Blight: from the board, put it here instead of onto the Blight Card. As soon as you have 3 :Blight: per player here, move it all back to the Blight Card.",
    },
    6: {
      name: "Persistent Explorers",
      effect:
        "After resolving an Explore Card, on each board add 1 :InvaderExplorer: to a land without any. Fear Card effects never remove :InvaderExplorer:. If one would, you may instead Push that :InvaderExplorer:.",
    },
  },
};

var habsburg = {
  title: "habsburg_livestock",
  name: "The Habsburg Monarchy",
  emote: "<:FlagHabsburg:852366013638639636>",
  difficulty: [2, 3, 5, 6, 8, 9, 10],
  panel: "https://imgur.com/GtptfDJ",
  alias: [
    "<:FlagHabsburg:852366013638639636>",
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
      effect:
        "After the normal Build Step: In each land matching a Build Card, Gather 1 :InvaderTown: from a land not matching a Build Card. (In board/land order.)",
    },
    2: {
      name: "More Rural Than Urban",
      effect:
        "During Setup, on each board, add 1 :InvaderTown: to land #2 and 1 :InvaderTown: to the highest-numbered land without Setup symbols. During Play, when Invaders would Build 1 :InvaderCity: in an Inland land, they instead Build 2 :InvaderTown:.",
    },
    3: {
      name: "Fast Spread",
      effect:
        "When making the Invader Deck, Remove 1 additional Stage I Card. ",
    },
    4: {
      name: "Herds Thrive in Verdant Lands",
      effect:
        ':InvaderTown: in lands without :Blight: are Durable: they have +2 Health, and "Destroy :InvaderTown:" effects instead deal 2 Damage (to those :InvaderTown: only) per :InvaderTown: they could Destroy. ("Destroy all :InvaderTown:" works normally.)',
    },
    5: {
      name: "Wave of Immigration",
      effect:
        "Before the initial Explore, put the Habsburg Reminder Card under the top 5 Invader Cards. When Revealed, on each board, add 1 :InvaderCity: to a Coastal land without :InvaderCity: and 1 :InvaderTown: to the 3 Inland lands with the fewest :Blight:.",
    },
    6: {
      name: "Far-Flung Herds",
      effect:
        "Ravages do +2 Damage (total) if any adjacent lands have :InvaderTown:. (This does not cause lands without Invaders to Ravage.)",
    },
  },
};

var russia = {
  title: "russia",
  name: "The Tsardom of Russia",
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
      effect:
        "During Setup, on each board, add 1 :TokenBeasts: and 1 :InvaderExplorer: to the highest-numbered land without :InvaderTown:/:InvaderCity:. During Play, :InvaderExplorer: do +1 Damage. When Ravage adds :Blight: to a land (including cascades), Destroy 1 :TokenBeasts: in that land.",
    },
    2: {
      name: "A Sense for Impending Disaster",
      effect:
        "The first time each Action would Destroy :InvaderExplorer:: If possible, 1 of those :InvaderExplorer: is instead Pushed; 1 :TokenFear: when you do so.",
    },
    3: {
      name: "Competition Among Hunters",
      effect:
        "Ravage Cards also match lands with 3 or more :InvaderExplorer:. (If the land already matched the Ravage Card, it still Ravages just once.)",
    },
    4: {
      name: "Accelerated Exploitation",
      effect:
        "When making the Invader Deck, put 1 Stage III Card after each Stage II Card. ",
    },
    5: {
      name: "Entrench in the Face of Fear",
      effect:
        "Put an unused Stage II Invader Card under the top 3 Fear Cards, and an unused Stage III Card under the top 7 Fear Cards. When one is revealed, immediately place it in the Build space (face-up).",
    },
    6: {
      name: "Pressure for Fast Profit",
      effect:
        "After the Ravage Step of turn 2+, on each board where it added no :Blight:: In the land with the most :InvaderExplorer: (min. 1), add 1 :InvaderExplorer: and 1 :InvaderTown:.",
    },
  },
};

var scotland = {
  title: "scotland",
  name: "The Kingdom of Scotland",
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
      console.log(`indices of non adversary stage ii cards : ${indices}`);
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
      // replaces the last stage 1 card with the bottom stage 3 card
      const index = d.findLastIndex((card) => card.stage === 1);
      if (index !== -1) {
        const stage3index = d.findLastIndex((card) => card.stage === 3);
        if (stage3index > -1) {
          // replaces the last stage 1 card with the last stage 3 card
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
    effect:
      "On the single board with the most Coastal :InvaderTown:/:InvaderCity:, add 1 :InvaderTown: to the N lands with the fewest :InvaderTown: (N = # of players.)",
  },
  escalation: {
    name: "Ports Sprawl Outward",
    effect:
      "On the single board with the most Coastal :InvaderTown:/:InvaderCity:, add 1 :InvaderTown: to the N lands with the fewest :InvaderTown: (N = # of players.)",
  },
  rules: {
    1: {
      name: "Trading Port",
      effect:
        'After Setup, in Coastal lands, Explore Cards add 1 :InvaderTown: instead of 1 :InvaderExplorer: . "Coastal Lands" Invader cards do this for maximum 2 lands per board.',
    },
    2: {
      name: "Seize Opportunity",
      effect:
        'During Setup, add 1 :InvaderCity: to land #2. Place "Coastal Lands" as the 3rd Stage II card, and move the two Stage II Cards above it up by one.',
    },
    3: {
      name: "Chart the Coastline",
      effect:
        "In Coastal lands, Build Cards affect lands without Invaders, so long as there is an adjacent :InvaderCity:.",
    },
    4: {
      name: "Ambition of a Minor Nation",
      effect:
        "During Setup, replace the bottom Stage I Card with the bottom Stage III Card.",
    },
    5: {
      name: "Runoff and Bilgewater",
      effect:
        "After a Ravage Action adds :Blight: to a Coastal Land, add 1 :Blight: to that board's Ocean (without cascading). Treat the Ocean as a Coastal Wetland for this rule and for :Blight: removal/movement.",
    },
    6: {
      name: "Exports Fuel Inward Growth",
      effect:
        "After the Ravage step, add 1 :InvaderTown: to each Inland land that matches a Ravage card and is within 1 Range of :InvaderTown:/:InvaderCity:.",
    },
  },
};

var sweden = {
  title: "sweden",
  name: "The Kingdom of Sweden",
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
      "After Invaders Explore into each land this Phase, if that land has at least as many Invaders as :Dahan:, replace 1 :Dahan: with 1 :InvaderTown:.",
  },
  rules: {
    1: {
      name: "Heavy Mining",
      effect:
        "If the Invaders do at least 6 Damage to the land during Ravage, add an extra Blight. The additional :Blight: does not destroy :Presence: or cause cascades.",
    },
    2: {
      name: "Population Pressure at Home",
      effect:
        "During Setup, on each board add 1 :InvaderCity: to land #4. On boards where land #4 starts with :Blight:, put that :Blight: in land #5 instead.",
    },
    3: {
      name: "Fine Steel for Tools and Guns",
      effect: ":InvaderTown: deal 3 Damage. :InvaderCity: deal 5 Damage.",
    },
    4: {
      name: "Royal Backing",
      effect:
        "During Setup, after adding all other Invaders, Accelerate the Invader Deck. On each board, add 1 :InvaderTown: to the land of that terrain with the fewest Invaders.",
    },
    5: {
      name: "Mining Rush",
      effect:
        "When Ravaging adds at least 1 :Blight: to a land, also add 1 :InvaderTown: to an adjacent land without :InvaderTown:/:InvaderCity:. Cascading :Blight: does not cause this effect.",
    },
    6: {
      name: "Prospecting Outpost",
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

exports.ad = ad;
