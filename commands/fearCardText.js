/*
Fear card text (name + Level 1/2/3 effect), vendored from the SICK card
katalog's own data (https://github.com/oberien/spirit-island-card-katalog,
src/db.ts, dual MIT/Apache licensed by its author). SICK itself only ever
renders card images - it never exposes this text on the page - and it isn't
an npm package or a live service to depend on (no package.json, no build
output, a client-side-only namespaced-TypeScript app coupled to its own DOM
bootstrap), so this is a point-in-time snapshot rather than a dependency.

slug matches the corresponding entry in ImageNames.fear (same source: SICK
image filenames). To refresh, pull the `new FearCard(set, FearType.Fear,
name, level1, level2, level3)` entries out of that repo's src/db.ts.
*/

var fearCardText = [
  {
    slug: "fear_of_the_unseen",
    name: "Fear of the Unseen",
    level1:
      "Each player removes 1 Explorer / Town from a land with SacredSite.",
    level2: "Each player removes 1 Explorer / Town from a land with Presence.",
    level3:
      "Each player removes 1 Explorer / Town from a land with Presence, or 1 City from a land with SacredSite.",
  },
  {
    slug: "scapegoats",
    name: "Scapegoats",
    level1: "Each Town destroys 1 Explorer in its land.",
    level2:
      "Each Town destroys 1 Explorer in its land. Each City destroys 2 Explorer in its land.",
    level3:
      "Destroy all Explorer in lands with Town / City. Each City destroys 1 Town in its land.",
  },
  {
    slug: "emigration_accelerates",
    name: "Emigration Accelerates",
    level1: "Each player removes 1 Explorer from a Coastal land.",
    level2: "Each player removes 1 Explorer / Town from a Coastal land.",
    level3: "Each player removes 1 Explorer / Town from any land.",
  },
  {
    slug: "dahan_on_their_guard",
    name: "Dahan on their Guard",
    level1: "In each land, Defend 1 per Dahan.",
    level2:
      "In each land with Dahan, Defend 1, plus an additional Defend 1 per Dahan.",
    level3: "In each land, Defend 2 per Dahan.",
  },
  {
    slug: "tall_tales_of_savagery",
    name: "Tall Tales of Savagery",
    level1: "Each player removes 1 Explorer from a land with Dahan.",
    level2: "Each player removes 2 Explorer or 1 Town from a land with Dahan.",
    level3:
      "Remove 2 Explorer or 1 Town from each land with Dahan. Then, remove 1 City from each land with at least 2 Dahan.",
  },
  {
    slug: "retreat",
    name: "Retreat!",
    level1: "Each player may Push up to 2 Explorer from an Inland land.",
    level2: "Each player may Push up to 3 Explorer / Town from an Inland land.",
    level3: "Each player may Push any number of Explorer / Town from one land.",
  },
  {
    slug: "dahan_raid",
    name: "Dahan Raid",
    level1: "Each player chooses a different land with Dahan. 1 Damage there.",
    level2:
      "Each player chooses a different land with Dahan. 1 Damage per Dahan there.",
    level3:
      "Each player chooses a different land with Dahan. 2 Damage per Dahan there.",
  },
  {
    slug: "dahan_enheartened",
    name: "Dahan Enheartened",
    level1:
      "Each player may Push 1 Dahan from a land with Invaders or Gather 1 Dahan into a land with Invaders.",
    level2:
      "Each player chooses a different land. In chosen lands: Gather up to 2 Dahan, then 1 Damage if Dahan are present.",
    level3:
      "Each player chooses a different land. In chosen lands: Gather up to 2 Dahan, then 1 Damage per Dahan present.",
  },
  {
    slug: "avoid_the_dahan",
    name: "Avoid the Dahan",
    level1: "Invaders do not Explore into lands with at least 2 Dahan.",
    level2: "Invaders do not Build in lands where Dahan outnumber Town / City.",
    level3: "Invaders do not Build in lands with Dahan.",
  },
  {
    slug: "seek_safety",
    name: "Seek Safety",
    level1:
      "Each player may Push 1 Explorer into a land with more Town / City than the land it came from.",
    level2:
      "Each player may Gather 1 Explorer into a land with Town / City, or Gather 1 Town into a land with City.",
    level3:
      "Each player may remove up to 3 Health worth of Invaders from a land without City.",
  },
  {
    slug: "wary_of_the_interior",
    name: "Wary of the Interior",
    level1: "Each player removes 1 Explorer from an Inland land.",
    level2: "Each player removes 1 Explorer / Town from an Inland land.",
    level3: "Each player removes 1 Explorer / Town from any land.",
  },
  {
    slug: "belief_takes_root",
    name: "Belief Takes Root",
    level1: "Defend 2 in all lands with Presence.",
    level2:
      "Defend 2 in all lands with Presence. Each Spirit gains 1 Energy per SacredSite they have in lands with Invaders.",
    level3:
      "Each player chooses a different land and removes up to 2 Health worth of Invaders per Presence there.",
  },
  {
    slug: "isolation",
    name: "Isolation",
    level1:
      "Each player removes 1 Explorer / Town from a land where it is the only Invader.",
    level2:
      "Each player removes 1 Explorer / Town from a land with 2 or fewer Invaders.",
    level3:
      "Each player removes an Invader from a land with 2 or fewer Invaders.",
  },
  {
    slug: "overseas_trade_seem_safer",
    name: "Overseas Trade Seem Safer",
    level1: "Defend 3 in all Coastal lands.",
    level2:
      "Defend 6 in all Coastal lands. Invaders do not Build City in Coastal lands this turn.",
    level3:
      "Defend 9 in all Coastal lands. Invaders do not Build in Coastal lands this turn.",
  },
  {
    slug: "trade_suffers",
    name: "Trade Suffers",
    level1: "Invaders do not Build in lands with City.",
    level2: "Each player may replace 1 Town with 1 Explorer in a Coastal land.",
    level3:
      "Each player may replace 1 City with 1 Town or 1 Town with 1 Explorer in a Coastal land.",
  },
  {
    slug: "demoralized",
    name: "Demoralized",
    level1: "Defend 1 in all lands.",
    level2: "Defend 2 in all lands.",
    level3: "Defend 3 in all lands.",
  },
  {
    slug: "plan_for_departure",
    name: "Plan for Departure",
    level1: "Each player may Gather 1 Town into a Coastal land.",
    level2:
      "Each player may Gather 1 Explorer / Town into a Coastal land. Defend 2 in all Coastal lands.",
    level3:
      "Each player may Gather up to 2 Explorer / Town into a Coastal land. Defend 4 in all Coastal lands.",
  },
  {
    slug: "tread_carefully",
    name: "Tread Carefully",
    level1:
      "Each player may choose a land with Dahan or adjacent to at least 5 Dahan. Invaders do not Ravage there this turn.",
    level2:
      "Each player may choose a land with Dahan or adjacent to at least 3 Dahan. Invaders do not Ravage there this turn.",
    level3:
      "Each player may choose a land with Dahan or adjacent to Dahan. Invaders do not Ravage there this turn.",
  },
  {
    slug: "dahan_attack",
    name: "Dahan Attack",
    level1: "Each player removes 1 Explorer from a land with Dahan.",
    level2:
      "Each player chooses a different land with Dahan. 1 Damager per Dahan there.",
    level3:
      "Each player chooses a different land with Town / City. Gather 1 Dahan into that land. Then, 2 Damage per Dahan there.",
  },
  {
    slug: "explorers_are_reluctant",
    name: "Explorers are Reluctant",
    level1:
      "During the next normal Explore, skip the lowest-numbered land matching the Invader Card on each board.",
    level2:
      "Skip the next normal Explore. During the next invader Phase, draw an additional Explore card.",
    level3:
      "Skip the next normal Explore, but still reveal a card. (Perform the Escalation if relevant.) Cards shift left as usual.",
  },
  {
    slug: "immigration_slows",
    name: "Immigration Slows",
    level1:
      "During the next normal Build, skip the lowest-numbered land matching the Invader Card on each board.",
    level2:
      "Skip the next normal Build. The Build Card remains in place instead of shifting left.",
    level3: "Skip the next normal Build. The Build Card shifts left as usual.",
  },
  {
    slug: "flee_the_pestilent_land",
    name: "Flee the Pestilent Land",
    level1: "Each player removes 1 Explorer / Town from a land with Disease.",
    level2:
      "Each player removes up to 3 Health of Invaders from a land with Disease or 1 Explorer from an Inland land.",
    level3:
      "Each player removes up to 5 Health of Invaders from a land with Disease, or 1 Explorer / Town from an Inland land.",
  },
  {
    slug: "quarantine",
    name: "Quarantine",
    level1: "Explore does not affect Coastal lands.",
    level2:
      "Explore does not affect Coastal lands. Lands with Disease are not a source of Invaders when Exploring.",
    level3:
      "Explore does not affect Coastal lands. Invaders do not act in lands with Disease.",
  },
  {
    slug: "too_many_monsters",
    name: "Too Many Monsters",
    level1: "Each player removes 1 Explorer / Town from a land with Beasts.",
    level2:
      "Each player removes 1 Explorer and 1 Town from a land with Beasts, or 1 Explorer from a land adjacent to Beasts.",
    level3:
      "Each player removes 2 Explorer and 2 Town from a land with Beasts or 1 Explorer / Town from a land adjacent to Beasts.",
  },
  {
    slug: "panicked_by_wild_beasts",
    name: "Panicked by Wild Beasts",
    level1: "Each player adds 1 Strife in a land with or adjacent to Beasts.",
    level2:
      "Each player adds 1 Strife in a land with or adjacent to Beasts. Invaders skip their normal Explore and Build in lands with Beasts.",
    level3:
      "Each player adds 1 Strife in a land with or adjacent to Beasts. Invaders skip all normal Actions in lands with Beasts.",
  },
  {
    slug: "depart_the_dangerous_land",
    name: "Depart the Dangerous Land",
    level1:
      "Each player removes 1 Explorer from a land with Beasts, Disease, or at least 2 Dahan.",
    level2:
      "Each player removes 1 Explorer / town from a land with Beasts, Disease, or at least 2 Dahan.",
    level3:
      "Each player removes up to 4 Health worth of Invaders from a land with Beasts, Disease, or at least 2 Dahan.",
  },
  {
    slug: "unrest",
    name: "Unrest",
    level1: "Each player adds 1 Strife to a Town.",
    level2:
      "Each player adds 1 Strife to a Town. For the rest of this turn, Invaders have -1 Health per Strife to a minimum of 1.",
    level3:
      "Each player adds 1 Strife to an Invader. For the rest of this turn, Invaders have -1 Health per Strife to a minimum of 1.",
  },
  {
    slug: "panic",
    name: "Panic",
    level1:
      "Each player adds 1 Strife in a land with Beasts / Disease / Dahan.",
    level2:
      "Each player adds 1 Strife in a land with Beasts / Disease / Dahan. For the rest of this turn, Invaders have -1 Health per Strife to a minimum of 1.",
    level3:
      "Each player adds 1 Strife to an Invader. For the rest of this turn, Invaders have -1 Health per Strife to a minimum of 1.",
  },
  {
    slug: "discord",
    name: "Discord",
    level1:
      "Each player adds 1 Strife in a different land with at least 2 Invaders.",
    level2:
      "Each player adds 1 Strife in a different land with at least 2 Invaders. Then, each Invader takes 1 Damage per Strife it has.",
    level3:
      "Each player adds 1 Strife in a different land with at least 2 Invaders. Then, each Invader with Strife deals Damage to other Invaders in its land.",
  },
  {
    slug: "dahan_threaten",
    name: "Dahan Threaten",
    level1: "Each player adds 1 Strife in a land with Dahan.",
    level2:
      "Each player adds 1 Strife in a land with Dahan. For the rest of this turn, Invaders have -1 Health per Strife to a minimum of 1.",
    level3:
      "Each player adds 1 Strife in a land with Dahan. In every land with Strife, 1 Damage per Dahan.",
  },
  {
    slug: "sense_of_dread",
    name: "Sense of Dread",
    level1:
      "Terror Level 1: On Each Board: Remove 1 Explorer from a land matching a Ravage card.",
    level2:
      "Terror Level 2: On Each Board: Remove 1 Explorer / Town from a land matching a Ravage card.",
    level3:
      "Terror Level 3: On Each Board: Remove 1 Invader from a land matching a Ravage card.",
  },
  {
    slug: "flee_from_dangerous_lands",
    name: "Flee from Dangerous Lands",
    level1:
      "Terror Level 1: On Each Board: Push 1 Explorer / Town from a land with Badlands / Wilds / Dahan.",
    level2:
      "Terror Level 2: On Each Board: Remove 1 Explorer / Town from a land with Badlands / Wilds / Dahan.",
    level3:
      "Terror Level 3: On Each Board: Remove 1 Explorer / Town from any land, or Remove 1 City from a land with Badlands / Wilds / Dahan.",
  },
  {
    slug: "dahan_reclaim_fishing_grounds",
    name: "Dahan Reclaim Fishing Grounds",
    level1:
      "Terror Level 1: Each player chooses a different Coastal land with Dahan. In each: 1 Damage per Dahan.",
    level2:
      "Terror Level 2: Each player chooses a different Coastal land. In each: Gather up to 1 Dahan. 1 Damage per Dahan.",
    level3:
      "Terror Level 3: Each player chooses a different Coastal land. In each: Gather up to 1 Dahan. 2 Damage per Dahan.",
  },
  {
    slug: "beset_by_many_troubles",
    name: "Beset by Many Troubles",
    level1:
      "Terror Level 1: In each land with Badlands / Beasts / Disease / Wilds / Strife, Defend 3.",
    level2:
      "Terror Level 2: In each land with Badlands / Beasts / Disease / Wilds / Strife, or adjacent to 3 or more such tokens, Defend 5.",
    level3:
      "Terror Level 3: Every Badlands / Beasts / Disease / Wilds / Strife grants Defend 3 in its land and adjacent lands.",
  },
  {
    slug: "nerves_fray",
    name: "Nerves Fray",
    level1:
      "Terror Level 1: Each player adds 1 Strife in a land not matching a Ravage Card.",
    level2:
      "Terror Level 2: Each player adds 2 Strife in a single land not matching a Ravage Card.",
    level3:
      "Terror Level 3: Each player adds 2 Strife in a single land not matching a Ravage Card. 1 Fear per player.",
  },
  {
    slug: "theological_strife",
    name: "Theological Strife",
    level1:
      "Terror Level 1: Each player adds 1 Strife in a land with Presence.",
    level2:
      "Terror Level 2: Each player adds 1 Strife in a land with Presence. Each Spirit gains 1 Energy per SacredSite they have in lands with Invaders.",
    level3:
      "Terror Level 3: Each player adds 1 Strife in a land with Presence. Then, each Invader with Strife deals Damage to other Invaders in its land.",
  },
  {
    slug: "angry_mobs",
    name: "Angry Mobs",
    level1:
      "Terror Level 1: Each player may replace 1 Town with 2 Explorer. 1 Fear per player who does.",
    level2:
      "Terror Level 2: In each land with 2 or more Explorer, destroy 1 Explorer / Town per 2 Explorer.",
    level3:
      "Terror Level 3: In each land with 2 or more Explorer, destroy 1 Invader per 2 Explorer.",
  },
  {
    slug: "mimic_the_dahan",
    name: "Mimic the Dahan",
    level1:
      "Terror Level 1: Each player removes 1 Explorer / Town from a land with 2 or more Dahan.",
    level2:
      "Terror Level 2: Each player replaces 1 Explorer / Town with 1 Dahan in a land with 2 or more Dahan.",
    level3:
      "Terror Level 3: Each player replaces 1 Explorer / Town with 1 Dahan in a land with Dahan, or adjacent to 3 or more Dahan.",
  },
  {
    slug: "depopulation",
    name: "Depopulation",
    level1: "Terror Level 1: On Each Board: Replace 1 Town with 1 Explorer.",
    level2: "Terror Level 2: On Each Board: Remove 1 Town.",
    level3:
      "Terror Level 3: On Each Board: Remove 1 Town, or Replace 1 City with 1 Town.",
  },
  {
    slug: "communities_in_disarray",
    name: "Communities in Disarray",
    level1:
      "Terror Level 1: City each deal -1 Damage during Ravage. Invaders do not heal Damage at the end of this turn.",
    level2:
      "Terror Level 2: Town / City each deal -1 Damage during Ravage. Invaders do not heal Damage at the end of this turn.",
    level3:
      "Terror Level 3: Town / City each deal -2 Damage during Ravage. Invaders do not heal Damage at the end of this turn.",
  },
  {
    slug: "spreading_timidity",
    name: "Spreading Timidity",
    level1: "Terror Level 1: Each player chooses a land to Isolate.",
    level2:
      "Terror Level 2: Each player chooses a different land to Isolate. Also, Defend 2 in those lands.",
    level3:
      "Terror Level 3: Each player chooses a different land to Isolate. Also, Defend 4 in those lands.",
  },
  {
    slug: "civil_unrest",
    name: "Civil Unrest",
    level1:
      "Terror Level 1: On Each Board: Add 1 Strife to a Town / City in a land not matching a Ravage Card.",
    level2:
      "Terror Level 2: On Each Board: Add 1 Strife to a Town / City in a land not matching a Ravage Card. Each Invader takes 1 Damage per Strife it has.",
    level3:
      "Terror Level 3: On Each Board: Add 1 Strife. Each Invader takes 1 Damage per Strife it has.",
  },
  {
    slug: "dahan_gain_the_edge",
    name: "Dahan Gain the Edge",
    level1:
      "Terror Level 1: Each player chooses a different land with Dahan. In Each: Defend 2.",
    level2:
      "Terror Level 2: Each player chooses a different land with Dahan. In Each: 1 Damage and Defend 3.",
    level3:
      "Terror Level 3: Each player chooses a different land with Dahan. In Each: 2 Damage and Defend 4.",
  },
  {
    slug: "daunted_by_the_dahan",
    name: "Daunted by the Dahan",
    level1:
      "Terror Level 1: 1 Fear per board with both Invaders and Dahan. Invaders do -6 Damage to Dahan (per land) during Ravage.",
    level2:
      "Terror Level 2: 1 Fear per board with both Invaders and Dahan. Lands with Dahan have Defend 3. Invaders do -6 Damage to Dahan (per land) during Ravage.",
    level3:
      "Terror Level 3: 1 Fear per board with both Invaders and Dahan. Lands with Dahan have Defend 3. Invaders do -6 Damage to Dahan (per land) during Ravage. Isolate all lands with Dahan.",
  },
  {
    slug: "distracted_by_local_troubles",
    name: "Distracted by Local Troubles",
    level1:
      "Terror Level 1: On Each Board, in a land matching a Ravage Card: 1 Damage.",
    level2:
      "Terror Level 2: Invaders do -1 Damage per Damage they have taken. On Each Board, in a land matching a Ravage Card: 1 Damage each to up to 2 Invaders.",
    level3:
      "Terror Level 3: Invaders do -1 Damage per Damage they have taken. On Each Board, in two lands matching a Ravage Card: 2 Damage (per land).",
  },
  {
    slug: "restlessness",
    name: "Restlessness",
    level1:
      "Terror Level 1: Each player Pushes up to 1 Explorer / Town from a land not matching a Build card.",
    level2:
      "Terror Level 2: Each player Pushes up to 3 Explorer / Town from a land not matching a Build card.",
    level3:
      "Terror Level 3: Each player Removes up to 3 Explorer / Town from a land not matching a Build card.",
  },
  {
    slug: "seek_company",
    name: "Seek Company",
    level1:
      "Terror Level 1: On Each Board: Gather up to 1 Explorer into a land with 2 or more Invaders.",
    level2:
      "Terror Level 2: On Each Board: Gather up to 3 Explorer / Town from a single land into a land with 2 or more Invaders.",
    level3:
      "Terror Level 3: On Each Board: Gather up to 4 Explorer / Town (total) into lands with 2 or more Invaders.",
  },
  {
    slug: "struggles_over_farmland",
    name: "Struggles over Farmland",
    level1: "Terror Level 1: Each player Adds 1 Strife in a land with Blight.",
    level2:
      "Terror Level 2: Each player Adds 1 Strife to a Town or Adds 1 Strife in a land with Blight.",
    level3:
      "Terror Level 3: Each player Adds 1 Strife. In each land with Blight, 1 Invader with Strife does Damage to other Invaders.",
  },
  {
    slug: "supply_chains_abandoned",
    name: "Supply Chains Abandoned",
    level1: "Terror Level 1: On Each Board: Isolate one land.",
    level2:
      "Terror Level 2: On Each Board: Isolate one land. If Town / City are present, skip all Build Actions (in that land).",
    level3:
      "Terror Level 3: On Each Board: Isolate two lands. In each of those lands, if Town / City are present, skip all Build Actions (in that land).",
  },
  {
    slug: "unsettled",
    name: "Unsettled",
    level1:
      "Terror Level 1: On Each Board: Choose a land with Beasts / Strife / Dahan. Downgrade 1 Town / City there.",
    level2:
      "Terror Level 2: On Each Board: Choose a land with Beasts / Strife / Dahan. Downgrade 1 Town / City there ore skip the next Build Action there (this turn).",
    level3:
      "Terror Level 3: On Each Board: Choose a land with Beasts / Strife / Dahan. Remove 1 Invader there or skip the next Build Action there (this turn).",
  },
];

exports.fearCardText = fearCardText;
