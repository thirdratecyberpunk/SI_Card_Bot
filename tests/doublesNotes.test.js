const {
  ad,
  getRulesForAdversary,
  getDoublesNotes,
} = require("../commands/AdversaryNames.js");

/**
 * Computes the doubles notes for a leading/supporting pairing the same way
 * commands/adversaryRules.js does: derive each side's active rules via
 * getRulesForAdversary(), then feed both into getDoublesNotes().
 */
function notesFor(leadingKey, leadingLevel, supportingKey, supportingLevel) {
  const leadingAdversary = ad.get(leadingKey);
  const supportingAdversary = supportingKey ? ad.get(supportingKey) : null;
  const leadRules = getRulesForAdversary(leadingAdversary, leadingLevel);
  const suppRules = supportingAdversary
    ? getRulesForAdversary(supportingAdversary, supportingLevel)
    : [];
  return getDoublesNotes({
    leadingAdversary,
    leadingLevel,
    leadRules,
    supportingAdversary,
    supportingLevel,
    suppRules,
  });
}

// Matches a note by its rule/escalation source name and a distinctive
// substring of its text, rather than the full string, so tests don't break
// on minor wording tweaks while still checking the right note fired.
function hasNote(notes, source, noteSubstring) {
  return notes.some(
    (n) => n.source === source && n.note.includes(noteSubstring),
  );
}

describe("getDoublesNotes()", () => {
  describe("solo play", () => {
    it("returns no notes when there is no supporting adversary", () => {
      expect(notesFor("habsburg", 5, null, null)).toEqual([]);
      expect(notesFor("prussia", 6, null, null)).toEqual([]);
    });
  });

  describe("specific-partner exceptions", () => {
    it("HM-LC 1 + England 3: Migratory Herders/High Immigration note, and only that note", () => {
      const notes = notesFor("habsburg", 1, "england", 3);
      expect(notes).toEqual([
        {
          source: "Migratory Herders",
          note: "RAI, only check the Build Cards in the Build Space — not High Immigration.",
        },
      ]);
    });

    it("is order-independent: same note whichever side is leading", () => {
      const asLeading = notesFor("habsburg", 1, "england", 3);
      const asSupporting = notesFor("england", 3, "habsburg", 1);
      expect(asSupporting).toEqual(asLeading);
    });

    it("does not fire below the partner's required level", () => {
      expect(
        hasNote(
          notesFor("habsburg", 1, "england", 2),
          "Migratory Herders",
          "RAI",
        ),
      ).toBe(false);
      expect(
        hasNote(
          notesFor("habsburg", 0, "england", 3),
          "Migratory Herders",
          "RAI",
        ),
      ).toBe(false);
    });

    it("HME 1 + England 3: Ceaseless Mining doesn't interact with High Immigration", () => {
      const notes = notesFor("habsburgmining", 1, "england", 3);
      expect(
        hasNote(notes, "Ceaseless Mining", "doesn't interact with England 3"),
      ).toBe(true);
    });

    it("Scotland 5 + HME 1: reassurance note that they don't interact", () => {
      expect(
        hasNote(
          notesFor("scotland", 5, "habsburgmining", 1),
          "Runoff and Bilgewater",
          "doesn't interact with HME 1",
        ),
      ).toBe(true);
    });

    it("Scotland 5 + HM-LC: doesn't interact, at any HM-LC level including 0", () => {
      expect(
        hasNote(
          notesFor("scotland", 5, "habsburg", 0),
          "Runoff and Bilgewater",
          "doesn't interact with HM-LC",
        ),
      ).toBe(true);
      expect(
        hasNote(
          notesFor("scotland", 5, "habsburg", 6),
          "Runoff and Bilgewater",
          "doesn't interact with HM-LC",
        ),
      ).toBe(true);
    });

    it("Sweden 1 + HM-LC: does interact, at any HM-LC level including 0", () => {
      expect(
        hasNote(
          notesFor("sweden", 1, "habsburg", 0),
          "Heavy Mining",
          "does interact",
        ),
      ).toBe(true);
    });

    it("Russia 5 + England 1 / Scotland 3: Fear Bomb re-check notes", () => {
      const withEngland = notesFor("russia", 5, "england", 1);
      expect(
        hasNote(
          withEngland,
          "Entrench in the Face of Fear",
          "England 1 re-checks",
        ),
      ).toBe(true);

      const withScotland = notesFor("russia", 5, "scotland", 3);
      expect(
        hasNote(
          withScotland,
          "Entrench in the Face of Fear",
          "Scotland 3 re-checks",
        ),
      ).toBe(true);

      // Below the partner's threshold, no re-check note.
      expect(
        hasNote(
          notesFor("russia", 5, "england", 0),
          "Entrench in the Face of Fear",
          "re-checks",
        ),
      ).toBe(false);
      // Below Russia 5, no re-check note even with a qualifying partner.
      expect(
        hasNote(
          notesFor("russia", 4, "england", 1),
          "Entrench in the Face of Fear",
          "re-checks",
        ),
      ).toBe(false);
    });

    it("HM-LC 5 + HME: Wave of Immigration resolves before HME's Escalation, at any HME level", () => {
      expect(
        hasNote(
          notesFor("habsburg", 5, "habsburgmining", 0),
          "Wave of Immigration",
          "before HME's Escalation",
        ),
      ).toBe(true);
    });

    it("HM-LC 1 + HME 3/5: Migratory Herders vs. Mining Boom is player choice", () => {
      expect(
        hasNote(
          notesFor("habsburg", 1, "habsburgmining", 3),
          "Migratory Herders",
          "order of player choice",
        ),
      ).toBe(true);
      expect(
        hasNote(
          notesFor("habsburg", 1, "habsburgmining", 5),
          "Migratory Herders",
          "order of player choice",
        ),
      ).toBe(true);
      expect(
        hasNote(
          notesFor("habsburg", 1, "habsburgmining", 2),
          "Migratory Herders",
          "order of player choice",
        ),
      ).toBe(false);
    });

    it("HM-LC 1 + HME 4: Salt Deposits gather-target/source timing note", () => {
      expect(
        hasNote(
          notesFor("habsburg", 1, "habsburgmining", 4),
          "Migratory Herders",
          "locked in before any gathering",
        ),
      ).toBe(true);
    });

    it("Sweden 4 + Prussia: Accelerate skip note requires Prussia 5+, not just Prussia 2+", () => {
      expect(
        hasNote(
          notesFor("sweden", 4, "prussia", 5),
          "Royal Backing",
          "skip over Prussia's early Stage III",
        ),
      ).toBe(true);
      expect(
        hasNote(
          notesFor("sweden", 4, "prussia", 2),
          "Royal Backing",
          "skip over Prussia's early Stage III",
        ),
      ).toBe(false);
      expect(
        hasNote(
          notesFor("sweden", 4, "prussia", 4),
          "Royal Backing",
          "skip over Prussia's early Stage III",
        ),
      ).toBe(false);
    });

    it("HME 4 + Scotland 2: doesn't stop Coastal Lands placement", () => {
      expect(
        hasNote(
          notesFor("habsburgmining", 4, "scotland", 2),
          "Untapped Salt Deposits",
          "doesn't stop Scotland 2",
        ),
      ).toBe(true);
    });

    it("HME 4 + Scotland 1: player-option note to limit 'S' like 'C'", () => {
      expect(
        hasNote(
          notesFor("habsburgmining", 4, "scotland", 1),
          "Untapped Salt Deposits",
          "Player option",
        ),
      ).toBe(true);
    });

    it("HME 4 + Russia 5: does stop 'C' from being a Fear Bomb", () => {
      expect(
        hasNote(
          notesFor("habsburgmining", 4, "russia", 5),
          "Untapped Salt Deposits",
          "does stop the Coastal Lands",
        ),
      ).toBe(true);
      // Below Russia 5, no such note.
      expect(
        hasNote(
          notesFor("habsburgmining", 4, "russia", 4),
          "Untapped Salt Deposits",
          "does stop the Coastal Lands",
        ),
      ).toBe(false);
    });

    it("Sweden Escalation + Russia 5: no effect on a Fear Bomb", () => {
      expect(
        hasNote(
          notesFor("sweden", 0, "russia", 5),
          "Swayed by the Invaders",
          "Russia 5 Fear Bomb",
        ),
      ).toBe(true);
    });

    it("Sweden Escalation + France 6: simultaneous trigger note requires France 6, not just France 1+", () => {
      expect(
        hasNote(
          notesFor("sweden", 0, "france", 6),
          "Swayed by the Invaders",
          "trigger at the same time",
        ),
      ).toBe(true);
      expect(
        hasNote(
          notesFor("sweden", 0, "france", 5),
          "Swayed by the Invaders",
          "trigger at the same time",
        ),
      ).toBe(false);
    });
  });

  describe("any-partner exceptions", () => {
    it("Prussia 2's Stage III Escalation note fires against any partner", () => {
      for (const partner of [
        "england",
        "france",
        "russia",
        "scotland",
        "sweden",
        "habsburg",
        "habsburgmining",
      ]) {
        expect(
          hasNote(
            notesFor("prussia", 2, partner, 0),
            "Surge of Colonists",
            "Stage III Escalation",
          ),
        ).toBe(true);
      }
    });

    it("Prussia 2's Stage III Escalation note requires level 2+", () => {
      expect(
        hasNote(
          notesFor("prussia", 1, "england", 0),
          "Surge of Colonists",
          "Stage III Escalation",
        ),
      ).toBe(false);
    });

    it("Prussia 6's Setup Escalation note fires against any partner", () => {
      expect(
        hasNote(
          notesFor("prussia", 6, "habsburgmining", 0),
          "Terrifyingly Efficient",
          "during Setup",
        ),
      ).toBe(true);
      expect(
        hasNote(
          notesFor("prussia", 6, "sweden", 0),
          "Terrifyingly Efficient",
          "during Setup",
        ),
      ).toBe(true);
    });

    it("France 3's on-island Setup ordering note fires against any partner", () => {
      expect(
        hasNote(
          notesFor("france", 3, "russia", 0),
          "Early Plantation",
          "Leading Adversary before the Supporting",
        ),
      ).toBe(true);
      expect(
        hasNote(
          notesFor("france", 3, "prussia", 0),
          "Early Plantation",
          "Leading Adversary before the Supporting",
        ),
      ).toBe(true);
    });

    it("Russia 1's on-island Setup ordering note fires against any partner", () => {
      expect(
        hasNote(
          notesFor("russia", 1, "france", 0),
          "Hunters Bring Home Shell and Hide",
          "Leading Adversary before the Supporting",
        ),
      ).toBe(true);
    });

    it("Scotland 2's City-redirect note fires against any partner", () => {
      expect(
        hasNote(
          notesFor("scotland", 2, "prussia", 0),
          "Seize Opportunity",
          "adjacent Inland land",
        ),
      ).toBe(true);
      expect(
        hasNote(
          notesFor("scotland", 2, "habsburgmining", 0),
          "Seize Opportunity",
          "adjacent Inland land",
        ),
      ).toBe(true);
    });

    it("Sweden 4's 'goes last in Setup' note fires against any partner, regardless of leading/supporting", () => {
      expect(
        hasNote(
          notesFor("sweden", 4, "russia", 0),
          "Royal Backing",
          "very end of Setup",
        ),
      ).toBe(true);
      expect(
        hasNote(
          notesFor("russia", 0, "sweden", 4),
          "Royal Backing",
          "very end of Setup",
        ),
      ).toBe(true);
    });
  });

  describe("noSetup-style filtering (rules omitted upstream produce no orphan notes)", () => {
    it("a note anchored on a rule that isn't in the supplied active-rules list doesn't appear", () => {
      // Simulates excludeSetupRules() stripping Setup-only rules before
      // getDoublesNotes() ever sees them: Seize Opportunity is Setup-only,
      // so if it's filtered out upstream, its exception must not surface.
      const leadingAdversary = ad.get("scotland");
      const supportingAdversary = ad.get("prussia");
      const notes = getDoublesNotes({
        leadingAdversary,
        leadingLevel: 2,
        leadRules: [], // pretend all of Scotland's rules were filtered out
        supportingAdversary,
        supportingLevel: 0,
        suppRules: getRulesForAdversary(supportingAdversary, 0),
      });
      expect(hasNote(notes, "Seize Opportunity", "adjacent Inland land")).toBe(
        false,
      );
    });
  });
});

describe("getRulesForAdversary() — replaces (superseding rules)", () => {
  it("England: level 3 shows High Immigration (I)", () => {
    const names = getRulesForAdversary(ad.get("england"), 3).map((r) => r.name);
    expect(names).toContain("High Immigration (I)");
  });

  it("England: level 4+ shows only High Immigration (full), not (I)", () => {
    const names = getRulesForAdversary(ad.get("england"), 4).map((r) => r.name);
    expect(names).toContain("High Immigration (full)");
    expect(names).not.toContain("High Immigration (I)");
  });

  it("HME: level 3-4 shows Mining Boom (I)", () => {
    const l3 = getRulesForAdversary(ad.get("habsburgmining"), 3).map(
      (r) => r.name,
    );
    const l4 = getRulesForAdversary(ad.get("habsburgmining"), 4).map(
      (r) => r.name,
    );
    expect(l3).toContain("Mining Boom (I)");
    expect(l4).toContain("Mining Boom (I)");
  });

  it("HME: level 5+ shows only Mining Boom (II), not (I)", () => {
    const names = getRulesForAdversary(ad.get("habsburgmining"), 5).map(
      (r) => r.name,
    );
    expect(names).toContain("Mining Boom (II)");
    expect(names).not.toContain("Mining Boom (I)");
  });

  it("replacement rules read standalone (no back-reference to the rule they replace)", () => {
    const englandFull = getRulesForAdversary(ad.get("england"), 4).find(
      (r) => r.name === "High Immigration (full)",
    );
    expect(englandFull.effect.toLowerCase()).not.toContain(
      "high immigration (i)",
    );

    const miningBoomII = getRulesForAdversary(ad.get("habsburgmining"), 5).find(
      (r) => r.name === "Mining Boom (II)",
    );
    expect(miningBoomII.effect).not.toMatch(/instead of/i);
  });
});

describe("getRulesForAdversary() — array-valued levels (multi-clause rules)", () => {
  it("HME level 1 expands to three distinct entries, not one duplicated block", () => {
    const rules = getRulesForAdversary(ad.get("habsburgmining"), 1);
    expect(rules).toHaveLength(3);

    const avarice = rules.find((r) => r.name === "Avarice Rewarded");
    expect(avarice.type).toEqual(["ravage"]);
    expect(avarice.effect).not.toContain("Ceaseless Mining");

    const ceaselessRavage = rules.find(
      (r) => r.name === "Ceaseless Mining" && r.type.includes("ravage"),
    );
    const ceaselessBuild = rules.find(
      (r) => r.name === "Ceaseless Mining" && r.type.includes("build"),
    );
    expect(ceaselessRavage).toBeDefined();
    expect(ceaselessBuild).toBeDefined();
    expect(ceaselessRavage.effect).not.toEqual(ceaselessBuild.effect);

    // All three share the same rule index (level 1).
    expect(rules.every((r) => r.index === 1)).toBe(true);
  });

  it("the England-3 exception is attached only to Ceaseless Mining (Build), not Avarice Rewarded", () => {
    const rules = getRulesForAdversary(ad.get("habsburgmining"), 1);
    const avarice = rules.find((r) => r.name === "Avarice Rewarded");
    const ceaselessBuild = rules.find(
      (r) => r.name === "Ceaseless Mining" && r.type.includes("build"),
    );
    expect(avarice.exceptions).toEqual([]);
    expect(ceaselessBuild.exceptions.length).toBeGreaterThan(0);
  });

  it("England level 6 splits Independent Resolve into Setup and Build entries", () => {
    const rules = getRulesForAdversary(ad.get("england"), 6);
    const entries = rules.filter((r) => r.name === "Independent Resolve");
    expect(entries).toHaveLength(2);

    const setupEntry = entries.find((r) => r.type.includes("setup"));
    const buildEntry = entries.find((r) => r.type.includes("build"));
    expect(setupEntry.effect).toMatch(/Fear Pool/);
    expect(buildEntry.effect).toMatch(/High Immigration twice/);
    expect(setupEntry.effect).not.toEqual(buildEntry.effect);
  });

  it("France level 2 splits Slave Labor into Setup and Build entries", () => {
    const entries = getRulesForAdversary(ad.get("france"), 2).filter(
      (r) => r.name === "Slave Labor",
    );
    expect(entries).toHaveLength(2);
    expect(entries.map((r) => r.type[0]).sort()).toEqual(["build", "setup"]);
  });

  it("HM-LC level 2 splits More Rural Than Urban into Setup and Build entries", () => {
    const entries = getRulesForAdversary(ad.get("habsburg"), 2).filter(
      (r) => r.name === "More Rural Than Urban",
    );
    expect(entries).toHaveLength(2);
    expect(entries.map((r) => r.type[0]).sort()).toEqual(["build", "setup"]);
  });

  it("Russia level 1 splits Hunters Bring Home Shell and Hide into Setup/Ongoing/Ravage entries", () => {
    const entries = getRulesForAdversary(ad.get("russia"), 1).filter(
      (r) => r.name === "Hunters Bring Home Shell and Hide",
    );
    expect(entries).toHaveLength(3);
    expect(entries.map((r) => r.type[0]).sort()).toEqual([
      "ongoing",
      "ravage",
      "setup",
    ]);

    // The on-island Setup-ordering exception belongs on the Setup clause only.
    const setupEntry = entries.find((r) => r.type.includes("setup"));
    const otherEntries = entries.filter((r) => r !== setupEntry);
    expect(setupEntry.exceptions.length).toBeGreaterThan(0);
    expect(otherEntries.every((r) => r.exceptions.length === 0)).toBe(true);
  });

  it("array-valued and plain-object levels can be mixed within the same adversary", () => {
    // HME has both array levels (1) and plain-object levels (2, 4, 6).
    const rules = getRulesForAdversary(ad.get("habsburgmining"), 2);
    expect(rules.map((r) => r.name)).toEqual(
      expect.arrayContaining([
        "Avarice Rewarded",
        "Ceaseless Mining",
        "Miners Come From Far and Wide",
      ]),
    );
  });
});
