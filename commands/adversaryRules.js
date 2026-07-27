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
} = require("./AdversaryNames.js");
const { combineDifficulty } = require("../utils/difficulty.js");
const {
  renderAdversaryCard,
} = require("../renderers/adversaryCardRenderer.js");

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

    const leadRules = getRulesForAdversary(leadingAdversary, leadingLevel);
    const suppRules = supportingAdversary
      ? getRulesForAdversary(supportingAdversary, supportingLevel)
      : [];

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

    lines.push("### Escalations");
    lines.push(
      `- **Leading (Stage II):** **${leadEsc.name}** — ${leadEsc.effect}`,
    );
    if (suppEsc) {
      lines.push(
        `- **Supporting (Stage III):** **${suppEsc.name}** — ${suppEsc.effect}`,
      );
    }

    if (leadLoss || suppLoss) {
      lines.push("### Loss Conditions");
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
