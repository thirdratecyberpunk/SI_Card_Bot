/**
 * Command to return the calculated information about 1 or 2 adversaries
 * (combined rules, escalation, loss conditions, fear deck, invader deck, etc.)
 */

const {
  ad,
  parseSetupArgs,
  computeInvaderDeck,
  computeFearDeck,
  getRulesForAdversary,
  getLossCondition,
  getDoublesNotes,
} = require("./AdversaryNames.js");
const { combineDifficulty } = require("../utils/difficulty.js");
const {
  renderAdversaryCard,
} = require("../renderers/adversaryCardRenderer.js");

// Strips "setup" out of each rule's type list (dropping the rule entirely if
// Setup was its only type), so a rule that's also e.g. Build-phase still
// shows up there even when Setup rules are hidden.
function excludeSetupRules(rules) {
  return rules
    .map((r) => ({ ...r, type: (r.type || []).filter((t) => t !== "setup") }))
    .filter((r) => r.type.length > 0);
}

module.exports = {
  name: "adversaryrules",
  description: "Get adversary information specific to a given setup.",
  public: true,

  async execute(msg, args) {
    // Normalize args
    let parts = [];
    if (!args) args = [];
    if (typeof args === "string") {
      parts = args.trim().split(/\s+/).filter(Boolean);
    } else if (Array.isArray(args)) {
      parts = args.slice();
    }

    // Remove md/markdown before parsing adversaries
    parts = parts.filter(
      (a) => a.toLowerCase() !== "md" && a.toLowerCase() !== "markdown",
    );

    // noSetup hides any Setup-phase rules (and the Setup section, if it ends up empty)
    const noSetup = parts.some((a) => a.toLowerCase() === "nosetup");
    parts = parts.filter((a) => a.toLowerCase() !== "nosetup");

    if (!ad) {
      return msg.reply("Adversary registry not available.");
    }

    // Parse adversaries
    let leadingAdversary, leadingLevel, supportingAdversary, supportingLevel;
    try {
      const parsed = parseSetupArgs(parts);
      leadingAdversary = parsed.leadingAdversary;
      leadingLevel = parsed.leadingLevel;
      supportingAdversary = parsed.supportingAdversary ?? null;
      supportingLevel = parsed.supportingLevel ?? null;
    } catch (err) {
      return msg.reply(err.message || String(err));
    }

    // Compute decks
    const fearDeck = computeFearDeck(
      leadingAdversary,
      leadingLevel,
      supportingAdversary,
      supportingLevel,
    );

    const invaderDeck = computeInvaderDeck(
      leadingAdversary,
      leadingLevel,
      supportingAdversary,
      supportingLevel,
    );

    // Difficulty
    const leadingDifficulty = leadingAdversary.difficulty[leadingLevel];
    const supportingDifficulty = supportingAdversary
      ? supportingAdversary.difficulty[supportingLevel]
      : 0;

    const combinedDifficulty = combineDifficulty(
      leadingDifficulty,
      supportingDifficulty,
    );

    // Escalations, loss, rules
    const leadEsc = leadingAdversary.escalation;
    const suppEsc = supportingAdversary?.escalation ?? null;

    const leadLoss = getLossCondition(
      leadingAdversary,
      leadingLevel,
      supportingAdversary ? supportingLevel : null,
    );
    const suppLoss = supportingAdversary
      ? getLossCondition(supportingAdversary, supportingLevel, leadingLevel)
      : null;

    let leadRules = getRulesForAdversary(leadingAdversary, leadingLevel);
    let suppRules = supportingAdversary
      ? getRulesForAdversary(supportingAdversary, supportingLevel)
      : [];

    if (noSetup) {
      leadRules = excludeSetupRules(leadRules);
      suppRules = excludeSetupRules(suppRules);
    }

    const doublesNotes = getDoublesNotes({
      leadingAdversary,
      leadingLevel,
      leadRules,
      supportingAdversary,
      supportingLevel,
      suppRules,
    });

    // Build output
    const lines = [];

    lines.push(
      `## ${leadingAdversary.name} ${leadingLevel}` +
        (supportingAdversary
          ? ` + ${supportingAdversary.name} ${supportingLevel}`
          : "") +
        ` ${leadingAdversary.emote}` +
        (supportingAdversary ? ` ${supportingAdversary.emote}` : ""),
    );

    lines.push(`**Difficulty:** ${combinedDifficulty}`);
    if (supportingAdversary) {
      lines.push(
        `**Difficulty is calculated as 100% of higher difficulty + 62.5% of lower difficulty rounded`,
      );
    }

    lines.push("### Invader Deck");
    lines.push(invaderDeck.formattedDeck());

    lines.push("### Fear Deck");
    lines.push(`(${fearDeck[0]}/${fearDeck[1]}/${fearDeck[2]})`);

    lines.push(suppEsc ? "### Escalations" : "### Escalation");
    lines.push(
      `- **Leading (Stage II):** **${leadEsc.name}** — ${leadEsc.effect}`,
    );
    if (suppEsc) {
      lines.push(
        `- **Supporting (Stage III):** **${suppEsc.name}** — ${suppEsc.effect}`,
      );
    }

    if (leadLoss || suppLoss) {
      lines.push(
        leadLoss && suppLoss ? "### Loss Conditions" : "### Loss Condition",
      );
      if (leadLoss) lines.push(`- **${leadLoss.name}** — ${leadLoss.effect}`);
      if (suppLoss) lines.push(`- **${suppLoss.name}** — ${suppLoss.effect}`);
    }

    // Doubles exceptions
    if (
      supportingAdversary &&
      (leadingAdversary.doublesNotes || supportingAdversary.doublesNotes)
    ) {
      lines.push("### Doubles modifications");
      if (leadingAdversary.doublesNotes) {
        lines.push(
          `- **${leadingAdversary.name}** — ${leadingAdversary.doublesNotes}`,
        );
      }
      if (supportingAdversary && supportingAdversary.doublesNotes) {
        lines.push(
          `- **${supportingAdversary.name}** — ${supportingAdversary.doublesNotes}`,
        );
      }
    }

    if (leadRules.length || suppRules.length) {
      lines.push("### Rules");
      for (const r of leadRules) {
        lines.push(`- **${r.name}:** ${r.effect}`);
      }
      for (const r of suppRules) {
        lines.push(`- **${r.name}:** ${r.effect}`);
      }
    }

    if (doublesNotes.length) {
      lines.push("### Notes");
      for (const n of doublesNotes) {
        lines.push(`- **${n.source}:** ${n.note}`);
      }
    }

    const output = lines.join("\n");

    // Always generate PNG using your renderer
    try {
      const pngBuffer = await renderAdversaryCard({
        leadingAdversary,
        leadingLevel,
        supportingAdversary,
        supportingLevel,
        combinedDifficulty,
        fearDeck,
        invaderDeck,
        leadEsc,
        suppEsc,
        leadLoss,
        suppLoss,
        leadRules,
        suppRules,
        doublesNotes,
        outputText: output,
      });

      return msg.reply({
        files: [{ attachment: pngBuffer, name: "adversary.png" }],
      });
    } catch (err) {
      console.error("PNG render failed:", err);

      return msg.reply(
        "Image rendering failed — something went wrong while generating the adversary card.",
      );
    }
  },
};
