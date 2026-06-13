/**
 * Command to return the calculated information about 1 or 2 adversaries
 * (combined rules, escalation, loss conditions, fear deck, invader deck, etc.)
 */

const {
  ad,
  parseSetupArgs,
  computeInvaderDeck,
  computeFearDeck,
} = require("./AdversaryNames.js");

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

    // Ensure registry exists
    if (!ad) {
      return msg.reply("Adversary registry not available.");
    }

    // Parse adversary setup using the shared helper
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

    // Reject 3‑token input (missing supporting difficulty)
    if (parts.length === 3) {
      return msg.reply(
        "If you specify a supporting adversary you must also provide its difficulty (e.g. `habsburg_mining 4 scotland 2`).",
      );
    }

    // Helper: extract rules up to a given difficulty level
    const getRulesFor = (adv, maxLevel) => {
      if (!adv.rules) return [];
      return Object.keys(adv.rules)
        .map(Number)
        .filter((i) => i <= maxLevel)
        .sort((a, b) => a - b)
        .map((i) => ({
          index: i,
          name: adv.rules[i].name,
          effect: adv.rules[i].effect,
        }));
    };

    // Compute fear deck using the shared helper
    const fearDeck = computeFearDeck(
      leadingAdversary,
      leadingLevel,
      supportingAdversary,
      supportingLevel,
    );

    // Compute invader deck using the shared helper
    const invaderDeck = computeInvaderDeck(
      leadingAdversary,
      leadingLevel,
      supportingAdversary,
      supportingLevel,
    );

    // Combined difficulty (simple sum — matches your existing logic)
    // TODO: fix this returning the level rather than the difficulty
    const combinedDifficulty = leadingLevel + (supportingLevel || 0);

    // Extract escalation + loss conditions
    const leadEsc = leadingAdversary.escalation;
    const suppEsc = supportingAdversary?.escalation ?? null;

    const leadLoss = leadingAdversary.lossCondition;
    const suppLoss = supportingAdversary?.lossCondition ?? null;

    const leadRules = getRulesFor(leadingAdversary, leadingLevel);
    const suppRules = supportingAdversary
      ? getRulesFor(supportingAdversary, supportingLevel)
      : [];

    // Build Markdown output
    const lines = [];

    lines.push(
      `## ${leadingAdversary.name}${supportingAdversary ? " + " + supportingAdversary.name : ""}`,
    );
    lines.push(`**Difficulty:** ${combinedDifficulty}`);
    lines.push("");

    // Invader Deck
    lines.push("### Invader Deck");
    lines.push(invaderDeck.formattedDeck());

    // Fear Deck
    lines.push("### Fear Deck");
    lines.push(`(${fearDeck[0]}/${fearDeck[1]}/${fearDeck[2]})`);

    // Escalations
    lines.push("### Escalations");
    lines.push(
      `- **Leading (Stage II):** **${leadEsc.name}** — ${leadEsc.effect}`,
    );
    if (suppEsc) {
      lines.push(
        `- **Supporting (Stage III):** **${suppEsc.name}** — ${suppEsc.effect}`,
      );
    }

    // Loss Conditions
    if (leadLoss || suppLoss) {
      lines.push("### Loss Conditions");
      if (leadLoss) lines.push(`- **${leadLoss.name}** — ${leadLoss.effect}`);
      if (suppLoss) lines.push(`- **${suppLoss.name}** — ${suppLoss.effect}`);
    }

    // Rules
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
