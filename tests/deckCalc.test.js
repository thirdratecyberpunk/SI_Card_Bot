const InvaderDeckCard = require("../commands/InvaderDeckCard.js");
const { ad, computeInvaderDeck } = require("../commands/AdversaryNames.js");

/**
 * Helper to run the invader deck calculation.
 * LEADING adversary always first.
 * SUPPORTING adversary always second.
 */
function run(
  leadingKey,
  leadingLevel,
  supportingKey = null,
  supportingLevel = null,
) {
  const leading = ad.get(leadingKey);
  const supporting = supportingKey ? ad.get(supportingKey) : null;
  return computeInvaderDeck(leading, leadingLevel, supporting, supportingLevel)
    .cards;
}

describe("computeInvaderDeck()", () => {
  // ------------------------------------------------------------
  // BASELINE
  // ------------------------------------------------------------
  describe("Baseline deck", () => {
    it("should produce the default deck for an adversary with no modifications", () => {
      const cards = run("england", 0);
      const expected = [
        new InvaderDeckCard(1),
        new InvaderDeckCard(1),
        new InvaderDeckCard(1),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });
  });

  // ------------------------------------------------------------
  // RUSSIA
  // ------------------------------------------------------------
  describe("Russia", () => {
    it("Russia 4", () => {
      const cards = run("russia", 4);
      const expected = [
        new InvaderDeckCard(1),
        new InvaderDeckCard(1),
        new InvaderDeckCard(1),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });
  });

  // ------------------------------------------------------------
  // PRUSSIA
  // ------------------------------------------------------------
  describe("Prussia", () => {
    const cases = [
      [2, [1, 1, 1, 3, 2, 2, 2, 2, 3, 3, 3, 3]],
      [3, [1, 1, 3, 2, 2, 2, 2, 3, 3, 3, 3]],
      [4, [1, 1, 3, 2, 2, 2, 3, 3, 3, 3]],
      [5, [1, 3, 2, 2, 2, 3, 3, 3, 3]],
      [6, [3, 2, 2, 2, 3, 3, 3, 3]],
    ];

    cases.forEach(([level, expectedStages]) => {
      it(`Prussia ${level}`, () => {
        const cards = run("prussia", level);
        const expected = expectedStages.map((s) => new InvaderDeckCard(s));
        expect(cards).toEqual(expected);
      });
    });
  });

  // ------------------------------------------------------------
  // HABSBURG LIVESTOCK (HLC)
  // ------------------------------------------------------------
  describe("Habsburg Livestock (HLC)", () => {
    it("HLC 3", () => {
      const cards = run("habsburg", 3);
      const expected = [
        new InvaderDeckCard(1),
        new InvaderDeckCard(1),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });

    it("HLC 5 (with reminder card)", () => {
      const cards = run("habsburg", 5);
      const expected = [
        new InvaderDeckCard(1),
        new InvaderDeckCard(1),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(0, "Wave of Immigration Reminder"),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });
  });

  // ------------------------------------------------------------
  // SCOTLAND
  // ------------------------------------------------------------
  describe("Scotland", () => {
    it("Scotland 2", () => {
      const cards = run("scotland", 2);
      const expected = [
        new InvaderDeckCard(1),
        new InvaderDeckCard(1),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(1),
        new InvaderDeckCard(2, "C"),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });

    it("Scotland 4", () => {
      const cards = run("scotland", 4);
      const expected = [
        new InvaderDeckCard(1),
        new InvaderDeckCard(1),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(2, "C"),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });
  });

  // ------------------------------------------------------------
  // HABSBURG MINING (HME)
  // ------------------------------------------------------------
  describe("Habsburg Mining (HME)", () => {
    it("HME 4", () => {
      const cards = run("habsburgmining", 4);
      const expected = [
        new InvaderDeckCard(1),
        new InvaderDeckCard(1),
        new InvaderDeckCard(1),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2, "S"),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });
  });

  // ------------------------------------------------------------
  // DOUBLES (LEADING first, SUPPORTING second)
  // ------------------------------------------------------------
  describe("Double adversaries", () => {
    it("Prussia LEADING, England SUPPORTING (no changes)", () => {
      const cards = run("prussia", 6, "england", 6);
      const expected = [
        new InvaderDeckCard(3),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });

    it("Prussia LEADING, Russia SUPPORTING", () => {
      const cards = run("prussia", 6, "russia", 6);
      const expected = [
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });

    it("Russia LEADING, Prussia SUPPORTING", () => {
      const cards = run("russia", 6, "prussia", 6);
      const expected = [
        new InvaderDeckCard(3),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });

    it("Prussia LEADING, Scotland SUPPORTING (Scotland 2)", () => {
      const cards = run("prussia", 2, "scotland", 2);
      const expected = [
        new InvaderDeckCard(1),
        new InvaderDeckCard(1),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(1),
        new InvaderDeckCard(3),
        new InvaderDeckCard(2, "C"),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });

    it("Prussia LEADING, Scotland SUPPORTING (Scotland 4)", () => {
      const cards = run("prussia", 4, "scotland", 4);
      const expected = [
        new InvaderDeckCard(1),
        new InvaderDeckCard(3),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(2, "C"),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });

    it("Scotland LEADING, Prussia SUPPORTING", () => {
      const cards = run("scotland", 6, "prussia", 6);
      const expected = [
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(2, "C"),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });

    it("HME LEADING, Prussia SUPPORTING", () => {
      const cards = run("habsburgmining", 6, "prussia", 6);
      const expected = [
        new InvaderDeckCard(3),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2, "S"),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });

    it("Prussia LEADING, HME SUPPORTING", () => {
      const cards = run("prussia", 6, "habsburgmining", 6);
      const expected = [
        new InvaderDeckCard(3),
        new InvaderDeckCard(2, "S"),
        new InvaderDeckCard(2),
        new InvaderDeckCard(2),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
        new InvaderDeckCard(3),
      ];
      expect(cards).toEqual(expected);
    });
  });

  // ------------------------------------------------------------
  // FORMATTING
  // ------------------------------------------------------------
  describe("Deck formatting", () => {
    it("Basic deck formatting", () => {
      const deck = computeInvaderDeck(ad.get("england"), 0);
      expect(deck.formattedDeck()).toEqual("111-2222-33333");
    });

    it("Prussia formatting", () => {
      const deck = computeInvaderDeck(ad.get("prussia"), 6);
      expect(deck.formattedDeck()).toEqual("3-222-3333");
    });

    it("Russia formatting", () => {
      const deck = computeInvaderDeck(ad.get("russia"), 4);
      expect(deck.formattedDeck()).toEqual("111-2-3-2-3-2-3-2-33");
    });

    it("Scotland formatting", () => {
      const deck = computeInvaderDeck(ad.get("scotland"), 4);
      expect(deck.formattedDeck()).toEqual("11-22-3-C2-3333");
    });

    it("HME formatting", () => {
      const deck = computeInvaderDeck(ad.get("habsburgmining"), 4);
      expect(deck.formattedDeck()).toEqual("111-2S22-33333");
    });
  });
});
