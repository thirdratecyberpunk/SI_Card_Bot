/**
 * Validates the data files in data/ against their JSON Schemas in
 * data/schemas/, plus the cross-record rules a schema can't express
 * (unique ids, scoped ids matching their owner, references resolving).
 */
const Ajv2020 = require("ajv/dist/2020");

const spirits = require("../data/spirits.json");
const cards = require("../data/cards.json");
const adversaries = require("../data/adversaries.json");

const ajv = new Ajv2020({ allErrors: true });
ajv.addSchema(require("../data/schemas/common.schema.json"));

const collections = [
  ["spirits.json", "spirit.schema.json", spirits],
  ["cards.json", "card.schema.json", cards],
  ["adversaries.json", "adversary.schema.json", adversaries],
  ["scenarios.json", "scenario.schema.json", require("../data/scenarios.json")],
  ["boards.json", "board.schema.json", require("../data/boards.json")],
];

const duplicatesIn = (values) =>
  values.filter((value, i) => values.indexOf(value) !== i);

describe.each(collections)("data/%s", (_file, schemaFile, records) => {
  const validate = ajv.compile(require(`../data/schemas/${schemaFile}`));

  it.each(records.map((record) => [record.id ?? record.name, record]))(
    `%s matches ${schemaFile}`,
    (_id, record) => {
      validate(record);
      expect(validate.errors ?? []).toEqual([]);
    },
  );

  it("has no duplicate ids", () => {
    expect(duplicatesIn(records.map((record) => record.id))).toEqual([]);
  });
});

describe("data/spirits.json", () => {
  it("has no duplicate ids across spirits, aspects and healing cards", () => {
    const ids = spirits.flatMap((spirit) => [
      spirit.id,
      ...spirit.aspects.map((aspect) => aspect.id),
      ...(spirit.healingCards ?? []).map((card) => card.id),
    ]);
    expect(duplicatesIn(ids)).toEqual([]);
  });

  it("scopes aspect and healing card ids under their spirit's id", () => {
    for (const spirit of spirits) {
      for (const child of [...spirit.aspects, ...(spirit.healingCards ?? [])]) {
        expect(child.id.startsWith(`${spirit.id}/`)).toBe(true);
      }
    }
  });

  it("gives every unique card to exactly one spirit", () => {
    const uniqueCards = cards
      .filter((card) => card.type === "unique")
      .map((card) => card.sickSlug);
    const listed = spirits.flatMap((spirit) => spirit.uniques);
    expect(listed.filter((slug) => !uniqueCards.includes(slug))).toEqual([]);
    expect(uniqueCards.filter((slug) => !listed.includes(slug))).toEqual([]);
    expect(duplicatesIn(listed)).toEqual([]);
  });

  it("hosts every incarna image on callofthedahanways.com", () => {
    const panels = spirits
      .flatMap((spirit) => [spirit, ...spirit.aspects])
      .flatMap((holder) => holder.incarna?.panel ?? []);
    expect(panels.length).toBeGreaterThan(0);
    for (const url of panels) {
      expect(url).toMatch(/^https:\/\/cdn\.callofthedahanways\.com\//);
    }
  });
});

describe("data/cards.json", () => {
  it("has no duplicate SICK slugs", () => {
    expect(duplicatesIn(cards.map((card) => card.sickSlug))).toEqual([]);
  });
});

describe("data/adversaries.json", () => {
  it("only refers to adversaries that exist in rule exceptions", () => {
    const ids = adversaries.map((adversary) => adversary.id);
    const referenced = adversaries.flatMap((adversary) =>
      [
        adversary.lossCondition,
        adversary.escalation,
        ...adversary.levels.flatMap((level) => level.rules),
      ]
        .flatMap((rule) => rule?.exceptions ?? [])
        .map((exception) => exception.with.adversary)
        .filter(Boolean),
    );
    expect(referenced.filter((id) => !ids.includes(id))).toEqual([]);
  });

  it("numbers each adversary's levels 0 to 6 in order", () => {
    for (const adversary of adversaries) {
      expect(adversary.levels.map((level) => level.level)).toEqual([
        0, 1, 2, 3, 4, 5, 6,
      ]);
    }
  });
});
