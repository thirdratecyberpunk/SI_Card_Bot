const { ad, computeFearDeck } = require("../commands/AdversaryNames.js");

/**
 * Helper to compute fear deck.
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
  return computeFearDeck(leading, leadingLevel, supporting, supportingLevel);
}

describe("computeFearDeck()", () => {
  // ------------------------------------------------------------
  // BASELINE
  // ------------------------------------------------------------
  describe("Baseline fear deck", () => {
    it("should return [3,3,3] for an adversary with no modifications", () => {
      const result = run("england", 0);
      expect(result).toEqual([3, 3, 3]);
    });
  });

  // ------------------------------------------------------------
  // SINGLE ADVERSARY TESTS
  // ------------------------------------------------------------
  describe("Single adversary fear deck modifications", () => {
    it("Prussia 1", () => {
      const result = run("prussia", 1);
      const expected = [
        3 + ad.get("prussia").fearDeckModification[1][0],
        3 + ad.get("prussia").fearDeckModification[1][1],
        3 + ad.get("prussia").fearDeckModification[1][2],
      ];
      expect(result).toEqual(expected);
    });

    it("Russia 3", () => {
      const result = run("russia", 3);
      const expected = [
        3 + ad.get("russia").fearDeckModification[3][0],
        3 + ad.get("russia").fearDeckModification[3][1],
        3 + ad.get("russia").fearDeckModification[3][2],
      ];
      expect(result).toEqual(expected);
    });

    it("Scotland 2", () => {
      const result = run("scotland", 2);
      const expected = [
        3 + ad.get("scotland").fearDeckModification[2][0],
        3 + ad.get("scotland").fearDeckModification[2][1],
        3 + ad.get("scotland").fearDeckModification[2][2],
      ];
      expect(result).toEqual(expected);
    });

    it("Habsburg Mining 4", () => {
      const result = run("habsburgmining", 4);
      const expected = [
        3 + ad.get("habsburgmining").fearDeckModification[4][0],
        3 + ad.get("habsburgmining").fearDeckModification[4][1],
        3 + ad.get("habsburgmining").fearDeckModification[4][2],
      ];
      expect(result).toEqual(expected);
    });
  });

  // ------------------------------------------------------------
  // DOUBLE ADVERSARY TESTS
  // ------------------------------------------------------------
  describe("Double adversaries (supporting modifies first)", () => {
    it("Prussia LEADING, Russia SUPPORTING", () => {
      const result = run("prussia", 3, "russia", 2);
      const expected = [
        3 +
          ad.get("prussia").fearDeckModification[3][0] +
          ad.get("russia").fearDeckModification[2][0],
        3 +
          ad.get("prussia").fearDeckModification[3][1] +
          ad.get("russia").fearDeckModification[2][1],
        3 +
          ad.get("prussia").fearDeckModification[3][2] +
          ad.get("russia").fearDeckModification[2][2],
      ];
      expect(result).toEqual(expected);
    });

    it("Russia LEADING, Prussia SUPPORTING", () => {
      const result = run("russia", 4, "prussia", 1);
      const expected = [
        3 +
          ad.get("russia").fearDeckModification[4][0] +
          ad.get("prussia").fearDeckModification[1][0],
        3 +
          ad.get("russia").fearDeckModification[4][1] +
          ad.get("prussia").fearDeckModification[1][1],
        3 +
          ad.get("russia").fearDeckModification[4][2] +
          ad.get("prussia").fearDeckModification[1][2],
      ];
      expect(result).toEqual(expected);
    });

    it("Scotland LEADING, HME SUPPORTING", () => {
      const result = run("scotland", 4, "habsburgmining", 4);
      const expected = [
        3 +
          ad.get("scotland").fearDeckModification[4][0] +
          ad.get("habsburgmining").fearDeckModification[4][0],
        3 +
          ad.get("scotland").fearDeckModification[4][1] +
          ad.get("habsburgmining").fearDeckModification[4][1],
        3 +
          ad.get("scotland").fearDeckModification[4][2] +
          ad.get("habsburgmining").fearDeckModification[4][2],
      ];
      expect(result).toEqual(expected);
    });

    it("HLC LEADING, Prussia SUPPORTING", () => {
      const result = run("habsburg", 5, "prussia", 2);
      const expected = [
        3 +
          ad.get("habsburg").fearDeckModification[5][0] +
          ad.get("prussia").fearDeckModification[2][0],
        3 +
          ad.get("habsburg").fearDeckModification[5][1] +
          ad.get("prussia").fearDeckModification[2][1],
        3 +
          ad.get("habsburg").fearDeckModification[5][2] +
          ad.get("prussia").fearDeckModification[2][2],
      ];
      expect(result).toEqual(expected);
    });
  });

  // ------------------------------------------------------------
  // ERROR HANDLING
  // ------------------------------------------------------------
  describe("Error handling", () => {
    it("throws if leading adversary is missing", () => {
      expect(() => computeFearDeck(null, 2)).toThrow();
    });

    it("throws if leading level is not a number", () => {
      expect(() => computeFearDeck(ad.get("prussia"), "x")).toThrow();
    });

    it("throws if leading level has no fearDeckModification", () => {
      expect(() => computeFearDeck(ad.get("prussia"), 99)).toThrow();
    });

    it("throws if supporting level has no fearDeckModification", () => {
      expect(() =>
        computeFearDeck(ad.get("prussia"), 2, ad.get("russia"), 99),
      ).toThrow();
    });
  });

  // ------------------------------------------------------------
  // STRUCTURE TESTS
  // ------------------------------------------------------------
  describe("Structure and formatting", () => {
    it("always returns an array of length 3", () => {
      const result = run("prussia", 1);
      expect(result.length).toBe(3);
    });

    it("values are integers", () => {
      const result = run("prussia", 1);
      result.forEach((v) => expect(Number.isInteger(v)).toBe(true));
    });
  });
});
