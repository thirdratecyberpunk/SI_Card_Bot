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
} = require("./AdversaryNames.js");
const { combineDifficulty } = require("../utils/difficulty.js");

module.exports = {
  name: "adversaryrules",
  description: "Get adversary information specific to a given setup.",
  public: true,

  async execute(msg, args) {
    let parts = [];
    if (!args) args = [];
    if (typeof args === "string") {
      parts = args.trim().split(/\s+/).filter(Boolean);
    } else if (Array.isArray(args)) {
      parts = args.slice();
    }

    if (!ad) {
      return msg.reply("Adversary registry not available.");
    }

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

    const leadingDifficulty = leadingAdversary.difficulty[leadingLevel];
    const supportingDifficulty = supportingAdversary
      ? supportingAdversary.difficulty[supportingLevel]
      : 0;

    const combinedDifficulty = combineDifficulty(
      leadingDifficulty,
      supportingDifficulty,
    );

    const leadEsc = leadingAdversary.escalation;
    const suppEsc = supportingAdversary?.escalation ?? null;

    const leadLoss = leadingAdversary.lossCondition;
    const suppLoss = supportingAdversary?.lossCondition ?? null;

    const leadRules = getRulesForAdversary(leadingAdversary, leadingLevel);
    const suppRules = supportingAdversary
      ? getRulesForAdversary(supportingAdversary, supportingLevel)
      : [];

    const lines = [];

    // TODO: move the name calculation to handler within adversary file, feels like this might be reusable
    lines.push(
      `## ${leadingAdversary.name} ${leadingLevel} ${supportingAdversary ? " + " + supportingAdversary.name : ""} ${supportingAdversary ? " " + supportingLevel : ""} ${leadingAdversary.emote} ${supportingAdversary ? supportingAdversary.emote : ""}`,
    );
    lines.push(`**Difficulty:** ${combinedDifficulty}`);

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

    if (leadRules.length || suppRules.length) {
      lines.push("### Rules");
      for (const r of leadRules) {
        lines.push(`- **${r.name}:** ${r.effect}`);
      }
      for (const r of suppRules) {
        lines.push(`- **${r.name}:** ${r.effect}`);
      }
    }

    return msg.reply(lines.join("\n"));
  },
};
