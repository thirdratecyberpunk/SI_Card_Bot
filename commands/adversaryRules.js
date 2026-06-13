/**
 * Command to return the calculated information about 1 or 2 adversaries
 * (i.e. combined setup instructions, fear deck etc.)
 */
const { ad } = require("./AdversaryNames.js");

module.exports = {
  name: "adversaryrules",
  description: "Get adversary information specific to a given setup.",
  public: true,
  async execute(msg, args) {
    // first, parse the arguments:
    // need to find at least one valid leading adversary
    // one leading difficulty
    // possibly one supporting adversary
    // if there is a supporting adversary, need a difficulty
    // if those are valid, then:
    // get the escalation effect for stage 2 (LEADING adversary)
    // get the escalation effect for stage 3 (SUPPORTING adversary)
    // get the loss conditions
    // calculate the combined difficulty
    // calculate the invader deck
    // calculate the fear deck
    // get the rules for both adversaries
    // put them into a tablular layout
    // return the message containining the tabular layout

    // Helper: normalize args input
    let parts = [];
    if (!args) args = [];
    if (typeof args === "string") {
      parts = args.trim().split(/\s+/).filter(Boolean);
    } else if (Array.isArray(args)) {
      parts = args.slice();
    } else {
      parts = [];
    }

    // Minimal registry lookup: try to find adversary by title, name, or alias.
    // This `adversaries` object must exist in the same runtime (require or global).
    // If it's not present, return an error.
    const registry = typeof ad !== "undefined" ? ad : null;
    if (!registry) {
      return msg.reply(
        "Adversary registry not available. Ensure `ad` is populated with adversary objects.",
      );
    }

    // Parse strategy:
    // Accept patterns:
    //  - <leadingAdversary> <leadingDifficulty>
    //  - <leadingAdversary> <leadingDifficulty> <supportingAdversary> <supportingDifficulty>
    // We'll accept difficulty either as an index (0..6) or as the actual difficulty value appearing in adversary.difficulty.
    // TODO: this should be handled by the parseSetupArgs method for consistency
    if (parts.length < 2) {
      return msg.reply(
        "Please provide at least a leading adversary and a difficulty (e.g. `habsburg_mining 4`).",
      );
    }

    let leadingAdversary;
    let leadingLevel;
    let supportingAdversary;
    let supportingLevel;
    try {
      const parsed = ad.parseSetupArgs(parts);
      leadingAdversary = parsed.leadingAdversary;
      leadingLevel = parsed.leadingLevel;
      supportingAdversary = parsed.supportingAdversary ?? null;
      supportingLevel = parsed.supportingLevel ?? null;
    } catch (err) {
      return msg.reply(err.message || String(err));
    }

    // Optional supporting adversary and difficulty
    if (parts.length === 3) {
      // If user provided three tokens, assume they omitted supporting difficulty
      return msg.reply(
        "If you specify a supporting adversary you must also provide its difficulty (e.g. `habsburg_mining 4 scotland 2`).",
      );
    }

    // Helper: rules extraction: returns array of {index,name,effect}
    // TODO: move this to adversary names
    const getRulesFor = (adversary, maxIndex) => {
      if (!adversary || !adversary.rules) return [];
      return Object.keys(adversary.rules)
        .map(Number)
        .filter((i) => i <= maxIndex)
        .sort((a, b) => a - b)
        .map((k) => {
          const r = adversary.rules[k];
          return { index: Number(k), name: r.name, effect: r.effect };
        });
    };

    // Helper: fear deck calculation
    // fearDeckModification is an object mapping difficulty index to an array of 3 numbers (per-stage changes).
    // TODO: migrate this to be the standard fear deck calculation
    const calcFearDeckCombined = (
      leadAdv,
      leadingLevel,
      suppAdv,
      supportingLevel,
    ) => {
      const base = [0, 0, 0];
      if (
        leadAdv &&
        leadAdv.fearDeckModification &&
        leadAdv.fearDeckModification[leadingLevel]
      ) {
        const arr = leadAdv.fearDeckModification[leadingLevel];
        base[0] += Number(arr[0] || 0);
        base[1] += Number(arr[1] || 0);
        base[2] += Number(arr[2] || 0);
      }
      if (
        suppAdv &&
        suppAdv.fearDeckModification &&
        suppAdv.fearDeckModification[supportingLevel]
      ) {
        const arr = suppAdv.fearDeckModification[supportingLevel];
        base[0] += Number(arr[0] || 0);
        base[1] += Number(arr[1] || 0);
        base[2] += Number(arr[2] || 0);
      }
      return base;
    };

    // Compose output table in Markdown (per Formatting Rules: use headings and tables for structured answers)
    // Build rows: Leading adversary, Leading difficulty, Escalation (Stage 2), Loss Condition, Rules
    const leadEsc = leadingAdversary.escalation;
    const suppEsc = supportingAdversary ? supportingAdversary.escalation : null;

    const leadLoss = leadingAdversary.lossCondition;
    const suppLoss = supportingAdversary
      ? supportingAdversary.lossCondition
      : null;

    const leadRules = getRulesFor(leadingAdversary, leadingLevel);
    const suppRules = supportingAdversary
      ? getRulesFor(supportingAdversary, supportingLevel)
      : [];

    // TODO: migrate difficulty calculation logic to adversary class
    const combinedDifficulty = leadingLevel + (supportingLevel || 0);

    const fearCombined = calcFearDeckCombined(
      leadingAdversary,
      leadingLevel,
      supportingAdversary,
      supportingLevel,
    );

    // Build markdown table content
    const lines = [];
    // adversary names
    // adversary difficulty
    // lines.push(`Difficulty ${combinedDifficulty}`);
    // adversary invader deck
    // lines.push("### Invader Deck");
    // lines.push(`${fearCombined}`);
    // adversary fear deck
    // lines.push("### Fear Deck");
    // lines.push(`${fearCombined}`);
    // Escalations (there will always be an escalation effect so no default required)
    lines.push("### Escalations");
    lines.push("");
    if (leadEsc) {
      lines.push(
        `- **Leading (Stage II):** **${leadEsc.name}** - ${leadEsc.effect}`,
      );
    }
    if (suppEsc) {
      lines.push(
        `- **Supporting (Stage III):** **${suppEsc.name}** - ${suppEsc.effect}`,
      );
    }
    // Loss conditions
    if (leadLoss || suppLoss) {
      lines.push("### Loss Conditions");
      lines.push("");
      if (leadLoss) {
        lines.push(`- **${leadLoss.name}** - ${leadLoss.effect}`);
      }
      if (suppLoss) {
        lines.push(`- **${suppLoss.name}** - ${suppLoss.effect}`);
      }
    }
    // adversary rules
    if (leadRules.length > 0 || suppRules.length > 0) {
      lines.push("### Rules");
      lines.push("");
      for (const r of leadRules) {
        lines.push(`- **${r.name}:** ${r.effect}`);
      }
      for (const r of suppRules) {
        lines.push(`- **${r.name}:** ${r.effect}`);
      }
      lines.push("");
    }
    const message = lines.join("\n");
    // Send the composed message
    return msg.reply(message);
  },
};
