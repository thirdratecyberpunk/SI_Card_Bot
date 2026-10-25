#!/usr/bin/env node
/**
 * Extracts the images the data files link to from the print-and-play PDFs
 * in Spirit_Island_low_res/, ready to upload to R2. Incarna and boards
 * aren't in the PDFs, so they're taken from the wiki images saved in
 * incarna/ and boards/ instead: PNGs are copied as-is and SVGs rendered to
 * PNG.
 *
 * Every page of the official PDFs is a single embedded 300dpi JPEG, so
 * pdfimages (poppler-utils) pulls it out without re-encoding. Aspect cards
 * printed landscape are stored sideways and get rotated upright, which does
 * re-encode them. Apocrypha PDFs are layered InDesign files instead, so
 * their pages are rendered at 300dpi with pdftoppm, and their cards cropped
 * out of the sheet they're printed on.
 *
 * Output goes to assets/, laid out as the bucket will be:
 *
 *   spirits/<id>/panel-1.jpg                      play side
 *   spirits/<id>/panel-2.jpg                      lore side
 *   spirits/<id>/power-progression.jpg
 *   spirits/<id>/aspects/<aspect>/panel-<n>.jpg
 *   spirits/<id>/healing/<card>/panel-<n>.jpg
 *   spirits/<id>/incarna/panel-<n>.png            unempowered, empowered
 *   spirits/<id>/aspects/<aspect>/incarna/panel-<n>.png
 *   spirits/<id>/extra-panels/<board>/panel-1.jpg
 *   cards/<id>.jpg                                cards SICK doesn't have
 *   scenarios/<id>/panel-<n>.jpg
 *   adversaries/<id>/panel.jpg
 *   boards/<id>.png
 *
 * Keys follow entity ids, which never change, so a published url stays
 * valid. assets/manifest.json records, for each key, the PDF page it came
 * from and the data field it replaces.
 *
 * Usage: node scripts/extractAssets.cjs [--source <dir>] [--out <dir>]
 *                                       [--only <text>]
 *   --only  extract just the images whose key contains <text> (e.g.
 *           "/incarna/" or "boards/"), merging them into the existing
 *           manifest.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { createCanvas, loadImage } = require("canvas");

const ROOT = path.join(__dirname, "..");

// spirit id -> PDF, relative to the source dir. Page 1 is the play side,
// page 2 the lore side.
const SPIRITS = {
  "a-spread-of-rampant-green": "base/spirit-green.pdf",
  "bringer-of-dreams-and-nightmares": "base/spirit-dreams-nightmares.pdf",
  "lightnings-swift-strike": "base/spirit-lightning.pdf",
  "oceans-hungry-grasp": "base/spirit-oceans.pdf",
  "river-surges-in-sunlight": "base/spirit-river.pdf",
  "shadows-flicker-like-flame": "base/spirit-shadows.pdf",
  thunderspeaker: "base/spirit-thunderspeaker.pdf",
  "vital-strength-of-the-earth": "base/spirit-earth.pdf",
  "keeper-of-the-forbidden-wilds": "branch-claw/spirit-keeper.pdf",
  "sharp-fangs-behind-the-leaves": "branch-claw/spirit-fangs.pdf",
  "downpour-drenches-the-world": "feather-flame/spirit-downpour.pdf",
  "finder-of-paths-unseen": "feather-flame/spirit-finder.pdf",
  "heart-of-the-wildfire": "feather-flame/spirit-wildfire.pdf",
  "serpent-slumbering-beneath-the-island": "feather-flame/spirit-serpent.pdf",
  "devouring-teeth-lurk-underfoot": "horizons/spirit-teeth.pdf",
  "eyes-watch-from-the-trees": "horizons/spirit-eyes.pdf",
  "fathomless-mud-of-the-swamp": "horizons/spirit-mud.pdf",
  "rising-heat-of-stone-and-sand": "horizons/spirit-heat.pdf",
  "sun-bright-whirlwind": "horizons/spirit-whirlwind.pdf",
  "fractured-days-split-the-sky": "jagged-earth/spirit-fractured-days.pdf",
  "grinning-trickster-stirs-up-trouble": "jagged-earth/spirit-trickster.pdf",
  "lure-of-the-deep-wilderness": "jagged-earth/spirit-lure.pdf",
  "many-minds-move-as-one": "jagged-earth/spirit-many-minds.pdf",
  "shifting-memory-of-ages": "jagged-earth/spirit-memory.pdf",
  "shroud-of-silent-mist": "jagged-earth/spirit-mist.pdf",
  "starlight-seeks-its-form": "jagged-earth/spirit-starlight.pdf",
  "stones-unyielding-defiance": "jagged-earth/spirit-stone.pdf",
  "vengeance-as-a-burning-plague": "jagged-earth/spirit-vengeance.pdf",
  "volcano-looming-high": "jagged-earth/spirit-volcano.pdf",
  "breath-of-darkness-down-your-spine": "nature-incarnate/spirit-darkness.pdf",
  "dances-up-earthquakes": "nature-incarnate/spirit-earthquakes.pdf",
  "ember-eyed-behemoth": "nature-incarnate/spirit-behemoth.pdf",
  "hearth-vigil": "nature-incarnate/spirit-hearth-vigil.pdf",
  "relentless-gaze-of-the-sun": "nature-incarnate/spirit-gaze.pdf",
  "towering-roots-of-the-jungle": "nature-incarnate/spirit-roots.pdf",
  "wandering-voice-keens-delirium": "nature-incarnate/spirit-voice.pdf",
  "wounded-waters-bleeding": "nature-incarnate/spirit-wwb.pdf",
};

// spirit id -> [PDF, page] of its Power Progression card front.
const PROGRESSIONS = {
  "vital-strength-of-the-earth": ["base/cards-progression.pdf", 1],
  "shadows-flicker-like-flame": ["base/cards-progression.pdf", 3],
  "lightnings-swift-strike": ["base/cards-progression.pdf", 5],
  "river-surges-in-sunlight": ["base/cards-progression.pdf", 7],
  "devouring-teeth-lurk-underfoot": ["horizons/cards-progression.pdf", 1],
  "eyes-watch-from-the-trees": ["horizons/cards-progression.pdf", 3],
  "fathomless-mud-of-the-swamp": ["horizons/cards-progression.pdf", 5],
  "rising-heat-of-stone-and-sand": ["horizons/cards-progression.pdf", 7],
  "sun-bright-whirlwind": ["horizons/cards-progression.pdf", 9],
};

// aspect id -> [PDF, pages of each face]. The PDFs interleave faces with
// the shared aspect back, which isn't used. A negative page is a landscape
// card stored sideways.
const ASPECT_PDFS = {
  ff: "feather-flame/cards-aspect.pdf",
  je: "jagged-earth/cards-aspect.pdf",
  ni: "nature-incarnate/cards-aspect.pdf",
};
const ASPECTS = {
  "shadows-flicker-like-flame/foreboding": ["ff", [-1]],
  "shadows-flicker-like-flame/amorphous": ["ff", [-2]],
  "lightnings-swift-strike/immense": ["ff", [-4]],
  "river-surges-in-sunlight/travel": ["ff", [-6]],
  "vital-strength-of-the-earth/might": ["ff", [-8]],
  "shadows-flicker-like-flame/madness": ["je", [-1]],
  "shadows-flicker-like-flame/reach": ["je", [-2]],
  "lightnings-swift-strike/pandemonium": ["je", [-4]],
  "lightnings-swift-strike/wind": ["je", [-5]],
  "river-surges-in-sunlight/sunshine": ["je", [-7]],
  "vital-strength-of-the-earth/resilience": ["je", [-9]],
  "shadows-flicker-like-flame/dark-fire": ["ni", [-1]],
  "oceans-hungry-grasp/deeps": ["ni", [3, 5]],
  "sharp-fangs-behind-the-leaves/encircle": ["ni", [7]],
  "bringer-of-dreams-and-nightmares/enticing": ["ni", [9]],
  "river-surges-in-sunlight/haven": ["ni", [11]],
  "shifting-memory-of-ages/intensify": ["ni", [-13]],
  "lure-of-the-deep-wilderness/lair": ["ni", [15]],
  "serpent-slumbering-beneath-the-island/locus": ["ni", [-17, 19]],
  "shifting-memory-of-ages/mentor": ["ni", [21]],
  "vital-strength-of-the-earth/nourishing": ["ni", [-23]],
  "a-spread-of-rampant-green/regrowth": ["ni", [25]],
  "lightnings-swift-strike/sparking": ["ni", [27, 29]],
  "keeper-of-the-forbidden-wilds/spreading-hostility": ["ni", [-31]],
  "shroud-of-silent-mist/stranded": ["ni", [-33]],
  "thunderspeaker/tactician": ["ni", [-35]],
  "a-spread-of-rampant-green/tangles": ["ni", [37, 39]],
  "heart-of-the-wildfire/transforming": ["ni", [41]],
  "sharp-fangs-behind-the-leaves/unconstrained": ["ni", [-43]],
  "bringer-of-dreams-and-nightmares/violence": ["ni", [45]],
  "thunderspeaker/warrior": ["ni", [47]],
};

// healing card id -> [PDF, [front page, back page]].
const HEALING = {
  "wounded-waters-bleeding/roiling-waters": [1, 2],
  "wounded-waters-bleeding/serene-waters": [3, 4],
  "wounded-waters-bleeding/waters-renew": [5, 6],
  "wounded-waters-bleeding/waters-taste-of-ruin": [7, 8],
};
const HEALING_PDF = "nature-incarnate/cards-healing.pdf";

// scenario id -> PDF. Page 1 is the front, page 2 the back.
const SCENARIOS = {
  blitz: "base/scenario-blitz.pdf",
  "guard-the-isles-heart": "base/scenario-isles-heart.pdf",
  "rituals-of-terror": "base/scenario-rituals-terror.pdf",
  "dahan-insurrection": "base/scenario-dahan-insurrection.pdf",
  "second-wave": "branch-claw/scenario-second-wave.pdf",
  "powers-long-forgotten": "branch-claw/scenario-powers.pdf",
  "ward-the-shores": "branch-claw/scenario-ward-shores.pdf",
  "rituals-of-the-destroying-flame":
    "branch-claw/scenario-destroying-flame.pdf",
  "elemental-invocation": "jagged-earth/scenario-elemental-invocation.pdf",
  "despicable-theft": "jagged-earth/scenario-theft.pdf",
  "the-great-river": "jagged-earth/scenario-great-river.pdf",
  "a-diversity-of-spirits": "feather-flame/scenario-diversity-spirits.pdf",
  "varied-terrains": "feather-flame/scenario-varied-terrains.pdf",
  "destiny-unfolds": "nature-incarnate/scenario-destiny.pdf",
  "surges-of-colonization": "nature-incarnate/scenario-surges.pdf",
  "larger-surges": "nature-incarnate/scenario-surges.pdf",
};

// adversary id -> PDF. Page 1 is the level table; page 2 (the map) isn't
// used.
const ADVERSARIES = {
  "the-kingdom-of-brandenburg-prussia": "base/adversary-brand-prussia.pdf",
  "the-kingdom-of-england": "base/adversary-england.pdf",
  "the-kingdom-of-sweden": "base/adversary-sweden.pdf",
  "the-kingdom-of-france": "branch-claw/adversary-france.pdf",
  "the-kingdom-of-scotland": "feather-flame/adversary-scotland.pdf",
  "the-habsburg-monarchy": "jagged-earth/adversary-habsburg.pdf",
  "the-tsardom-of-russia": "jagged-earth/adversary-russia.pdf",
  "habsburg-mining-expedition": "nature-incarnate/adversary-hme.pdf",
};

// spirit or aspect id -> images in incarna/: the unempowered side, then
// the empowered side if it has one.
const INCARNA = {
  "breath-of-darkness-down-your-spine": [
    "Breath_of_Darkness_Down_Your_Spine_Incarna.png",
    "Breath_of_Darkness_Down_Your_Spine_Empowered_Incarna.png",
  ],
  "covets-gleaming-shards-of-earth": [
    "Covets_Gleaming_Shards_of_Earth_Incarna.svg",
  ],
  "ember-eyed-behemoth": [
    "Ember-Eyed_Behemoth_Incarna.png",
    "Ember-Eyed_Behemoth_Empowered_Incarna.png",
  ],
  "towering-roots-of-the-jungle": [
    "Towering_Roots_of_the_Jungle_Incarna.png",
    "Towering_Roots_of_the_Jungle_Empowered_Incarna.png",
  ],
  "wandering-voice-keens-delirium": [
    "Wandering_Voice_Keens_Delirium_Incarna.png",
    "Wandering_Voice_Keens_Delirium_Empowered_Incarna.png",
  ],
  "lure-of-the-deep-wilderness/lair": [
    "Lure_of_the_Deep_Wilderness_Incarna_(Lair).png",
  ],
  "serpent-slumbering-beneath-the-island/locus": [
    "Serpent_Slumbering_Beneath_the_Island_Incarna_(Locus).png",
    "Serpent_Slumbering_Beneath_the_Island_Empowered_Incarna_(Locus).png",
  ],
  "thunderspeaker/warrior": ["Thunderspeaker_Incarna_(Warrior).png"],
};

// board id -> image in boards/.
const BOARDS = {
  a: "Piece_core_board_a.png",
  b: "Piece_core_board_b.png",
  c: "Piece_core_board_c.png",
  d: "Piece_core_board_d.png",
  e: "Piece_je_board_e.png",
  f: "Piece_je_board_f.png",
  g: "Piece_horizons_board_g.png",
  h: "Piece_horizons_board_h.png",
  "north-east": "Piece_core_board_north_east.png",
  "north-west": "Piece_core_board_north_west.png",
  east: "Piece_core_board_east.png",
  west: "Piece_core_board_west.png",
  "south-east": "Piece_je_board_south_east.png",
  "south-west": "Piece_je_board_south_west.png",
};

const APOCRYPHA = "branch-claw/apocrypha";

// Apocrypha spirit id -> PDF whose pages 1 and 2 are the play and lore
// sides, plus any extra boards: slug -> page, in `extraPanels` order.
const RENDERED_SPIRITS = {
  "covets-gleaming-shards-of-earth": {
    pdf: `${APOCRYPHA}/Panel - Covets Gleaming Shards of Earth.pdf`,
    extraPanels: { "the-gleaming-hoard": 3 },
  },
  "spreading-rot-renews-the-earth": {
    pdf: `${APOCRYPHA}/Spirit Panel - Spreading Rot Renews the Earth.pdf`,
  },
};

// Sheets of 2x2 cards (180x252pt each) on page 1, with the grid's top-left
// corner at `origin` (pt). Card ids run left to right, top to bottom.
const CARD_W = 180;
const CARD_H = 252;
const CARD_SHEETS = [
  {
    pdf: `${APOCRYPHA}/Uniques - Covets Gleaming Shards of Earth.pdf`,
    origin: [36, 18],
    cards: [
      "favors-of-steel-and-bone",
      "melt-earth-to-slag",
      "petition-for-smoldering-wrath",
      "unnerving-attention",
    ],
  },
  {
    pdf: `${APOCRYPHA}/Unique Powers TTS - Spreading Rot Renews the Earth.pdf`,
    origin: [0, 0],
    cards: [
      "land-of-deadfall-and-rot",
      "infesting-spores",
      "worms-and-bugs-enrich-the-soil",
      "exaltation-of-the-re-forming-land",
    ],
  },
];

/**
 * Every image to extract: its bucket key, source page, and the data field
 * whose url it replaces (`file`, entity `id`, `field` path within it).
 * Jobs with a `render` area ("page", or {x, y, w, h} in points) are
 * rendered rather than extracted, and jobs with an `image` (a path from the
 * repo root) are copied from it.
 */
function buildJobs() {
  const jobs = [];
  const add = (key, pdf, page, file, id, field, render) =>
    jobs.push({ key, pdf, page, file, id, field, render });

  for (const [id, pdf] of Object.entries(SPIRITS)) {
    add(`spirits/${id}/panel-1.jpg`, pdf, 1, "spirits", id, "panel[0]");
    add(`spirits/${id}/panel-2.jpg`, pdf, 2, "spirits", id, "panel[1]");
  }
  for (const [id, [pdf, page]] of Object.entries(PROGRESSIONS)) {
    add(
      `spirits/${id}/power-progression.jpg`,
      pdf,
      page,
      "spirits",
      id,
      "powerProgression",
    );
  }
  for (const [id, [set, pages]] of Object.entries(ASPECTS)) {
    const [spirit, aspect] = id.split("/");
    pages.forEach((page, i) =>
      add(
        `spirits/${spirit}/aspects/${aspect}/panel-${i + 1}.jpg`,
        ASPECT_PDFS[set],
        page,
        "spirits",
        id,
        `panel[${i}]`,
      ),
    );
  }
  for (const [id, pages] of Object.entries(HEALING)) {
    const [spirit, card] = id.split("/");
    pages.forEach((page, i) =>
      add(
        `spirits/${spirit}/healing/${card}/panel-${i + 1}.jpg`,
        HEALING_PDF,
        page,
        "spirits",
        id,
        `panel[${i}]`,
      ),
    );
  }
  for (const [id, pdf] of Object.entries(SCENARIOS)) {
    add(`scenarios/${id}/panel-1.jpg`, pdf, 1, "scenarios", id, "panel[0]");
    add(`scenarios/${id}/panel-2.jpg`, pdf, 2, "scenarios", id, "panel[1]");
  }
  for (const [id, pdf] of Object.entries(ADVERSARIES)) {
    add(`adversaries/${id}/panel.jpg`, pdf, 1, "adversaries", id, "panel");
  }
  for (const [id, { pdf, extraPanels = {} }] of Object.entries(
    RENDERED_SPIRITS,
  )) {
    const spirit = `spirits/${id}`;
    add(`${spirit}/panel-1.jpg`, pdf, 1, "spirits", id, "panel[0]", "page");
    add(`${spirit}/panel-2.jpg`, pdf, 2, "spirits", id, "panel[1]", "page");
    Object.entries(extraPanels).forEach(([board, page], i) =>
      add(
        `${spirit}/extra-panels/${board}/panel-1.jpg`,
        pdf,
        page,
        "spirits",
        id,
        `extraPanels[${i}].panel[0]`,
        "page",
      ),
    );
  }
  for (const [id, images] of Object.entries(INCARNA)) {
    const [spirit, aspect] = id.split("/");
    const dir = aspect
      ? `spirits/${spirit}/aspects/${aspect}/incarna`
      : `spirits/${spirit}/incarna`;
    images.forEach((image, i) =>
      jobs.push({
        key: `${dir}/panel-${i + 1}.png`,
        image: `incarna/${image}`,
        file: "spirits",
        id,
        field: `incarna.panel[${i}]`,
      }),
    );
  }
  for (const [id, image] of Object.entries(BOARDS)) {
    jobs.push({
      key: `boards/${id}.png`,
      image: `boards/${image}`,
      file: "boards",
      id,
      field: "image",
    });
  }
  for (const { pdf, origin, cards } of CARD_SHEETS) {
    cards.forEach((id, i) =>
      add(`cards/${id}.jpg`, pdf, 1, "cards", id, "image", {
        x: origin[0] + CARD_W * (i % 2),
        y: origin[1] + CARD_H * Math.floor(i / 2),
        w: CARD_W,
        h: CARD_H,
      }),
    );
  }
  return jobs;
}

/**
 * Writes the embedded JPEG on one page of a PDF to `dest`. A negative
 * page is rotated a quarter turn anticlockwise to stand it upright.
 */
async function extractPage(pdf, page, dest) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "si-assets-"));
  try {
    const n = String(Math.abs(page));
    execFileSync("pdfimages", ["-j", "-f", n, "-l", n, pdf, `${tmp}/p`]);
    const images = fs.readdirSync(tmp);
    if (images.length !== 1 || !images[0].endsWith(".jpg")) {
      throw new Error(
        `${pdf} page ${n}: expected one JPEG, got ${images.join(", ") || "nothing"}`,
      );
    }
    const src = path.join(tmp, images[0]);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (page > 0) {
      fs.copyFileSync(src, dest);
      return;
    }
    const img = await loadImage(src);
    const canvas = createCanvas(img.height, img.width);
    const ctx = canvas.getContext("2d");
    ctx.translate(0, img.width);
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(img, 0, 0);
    fs.writeFileSync(dest, canvas.toBuffer("image/jpeg", { quality: 0.92 }));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/**
 * Renders one page of a PDF to a JPEG at `dest`: the whole page, or just
 * the `area` ({x, y, w, h} in points) of it.
 */
function renderPage(pdf, page, area, dest) {
  const dpi = 300;
  const px = (pt) => String(Math.round((pt * dpi) / 72));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "si-assets-"));
  try {
    const n = String(page);
    const args = ["-jpeg", "-jpegopt", "quality=92", "-r", String(dpi)];
    args.push("-f", n, "-l", n, "-singlefile");
    if (area !== "page") {
      args.push("-x", px(area.x), "-y", px(area.y));
      args.push("-W", px(area.w), "-H", px(area.h));
    }
    execFileSync("pdftoppm", [...args, pdf, `${tmp}/p`]);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(`${tmp}/p.jpg`, dest);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/** Copies a PNG to `dest`, or renders an SVG to one at its own size. */
async function copyImage(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (path.extname(src) !== ".svg") {
    fs.copyFileSync(src, dest);
    return;
  }
  const img = await loadImage(fs.readFileSync(src));
  const canvas = createCanvas(img.width, img.height);
  canvas.getContext("2d").drawImage(img, 0, 0);
  fs.writeFileSync(dest, canvas.toBuffer("image/png"));
}

/**
 * Resolves a field path like "panel[1]", "powerProgression" or
 * "extraPanels[0].panel[0]" on the entity with `id` (top level or nested
 * aspect/healing card) to the object and key holding it, so callers can
 * read or replace the value.
 */
function locateField(data, file, id, field) {
  const [owner] = id.split("/");
  let entity = data[file].find((e) => e.id === owner);
  if (entity && id !== owner) {
    entity = [...(entity.aspects ?? []), ...(entity.healingCards ?? [])].find(
      (e) => e.id === id,
    );
  }
  if (!entity) throw new Error(`${file}: no entity ${id}`);
  let holder = entity;
  const steps = field.split(".");
  for (const [i, step] of steps.entries()) {
    const [, name, index] = step.match(/^(\w+)(?:\[(\d+)\])?$/);
    const keys = index === undefined ? [name] : [name, Number(index)];
    const last = i === steps.length - 1;
    for (const [j, key] of keys.entries()) {
      if (last && j === keys.length - 1) return { holder, key };
      holder = holder?.[key] ?? {};
    }
  }
}

function currentUrl(data, file, id, field) {
  const { holder, key } = locateField(data, file, id, field);
  return holder[key];
}

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : path.resolve(process.argv[i + 1]);
}

async function main() {
  const source = arg("--source", path.join(ROOT, "Spirit_Island_low_res"));
  const out = arg("--out", path.join(ROOT, "assets"));
  const only = process.argv[process.argv.indexOf("--only") + 1];
  const filter = process.argv.includes("--only") ? only : undefined;
  const data = Object.fromEntries(
    ["spirits", "cards", "scenarios", "adversaries", "boards"].map((f) => [
      f,
      JSON.parse(fs.readFileSync(path.join(ROOT, "data", `${f}.json`))),
    ]),
  );

  const manifest = [];
  const jobs = buildJobs().filter((job) => !filter || job.key.includes(filter));
  for (const job of jobs) {
    const replaces = currentUrl(data, job.file, job.id, job.field);
    if (replaces === undefined) {
      throw new Error(`${job.file}: ${job.id} has no ${job.field}`);
    }
    const dest = path.join(out, job.key);
    if (job.image) {
      await copyImage(path.join(ROOT, job.image), dest);
    } else {
      const pdf = path.join(source, job.pdf);
      if (job.render) renderPage(pdf, job.page, job.render, dest);
      else await extractPage(pdf, job.page, dest);
    }
    manifest.push({
      key: job.key,
      source: job.image ?? `${job.pdf}#${Math.abs(job.page)}`,
      file: `data/${job.file}.json`,
      id: job.id,
      field: job.field,
      replaces,
    });
  }

  const manifestPath = path.join(out, "manifest.json");
  if (filter && fs.existsSync(manifestPath)) {
    const keys = new Set(manifest.map((entry) => entry.key));
    const kept = JSON.parse(fs.readFileSync(manifestPath, "utf8")).filter(
      (entry) => !keys.has(entry.key),
    );
    manifest.unshift(...kept);
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`Extracted ${manifest.length} images to ${out}`);
}

module.exports = { locateField };

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
