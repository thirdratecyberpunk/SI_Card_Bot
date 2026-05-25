/**
 * Command to return the calculated information about 1 or 2 adversaries
 * (i.e. combined setup instructions, fear deck etc.)
 */
const ad = require("./AdversaryNames.js");

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
    const registry = typeof ad.ad !== "undefined" ? ad.ad : null;
    if (!registry) {
      return msg.reply(
        "Adversary registry not available. Ensure `ad.ad` is populated with adversary objects.",
      );
    }

    // Parse strategy:
    // Accept patterns:
    //  - <leadingAdversary> <leadingDifficulty>
    //  - <leadingAdversary> <leadingDifficulty> <supportingAdversary> <supportingDifficulty>
    // We'll accept difficulty either as an index (0..6) or as the actual difficulty value appearing in adversary.difficulty.

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

    // Helper: invader deck modification description
    const describeDeckModification = (adversary, diffIndex) => {
      if (!adversary || !adversary.deckModification)
        return "No deck modifications.";
      const mod = adversary.deckModification[diffIndex];
      if (!mod) return "No deck modification for that difficulty.";
      // If it's a function, describe it (we cannot execute as we don't have a deck object).
      if (typeof mod === "function") {
        // Try to obtain function source summary when possible
        const src = mod.toString();
        // brief heuristic to extract short description from comments inside function
        const commentMatch = src.match(
          "/\\/\\*([\s\S]*?)\\*\\/|\\/\\/\s*(.*)/",
        );
        const brief = commentMatch ? commentMatch[1] || commentMatch[2] : null;
        return brief
          ? `Function: ${brief.trim().split("\n")[0].trim()}`
          : "Function: modifies invader deck programmatically.";
      }
      // If it's an array/object, stringify a short version
      try {
        const s = JSON.stringify(mod);
        return s.length > 300 ? s.slice(0, 300) + "…" : s;
      } catch {
        return "Deck modification present.";
      }
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

    const combinedDifficulty = leadingLevel + (supportingLevel || 0);

    const fearCombined = calcFearDeckCombined(
      leadingAdversary,
      leadingLevel,
      supportingAdversary,
      supportingLevel,
    );

    const leadDeckModDesc = describeDeckModification(
      leadingAdversary,
      leadingLevel,
    );
    const suppDeckModDesc = supportingAdversary
      ? describeDeckModification(supportingAdversary, supportingLevel)
      : "-";

    // Build markdown table content
    // Major heading
    const lines = [];
    lines.push("## Adversary Setup Summary");
    lines.push("");
    // Top summary table
    lines.push(
      "| Role | Adversary | Difficulty (index → value) | Escalation (stage) |",
    );
    lines.push("| --- | --- | --- | --- |");
    lines.push(
      `| Leading | **\${leadingAdversary.title || leadingAdversary.name}** | \${leadingLevel} → \${leadingLevel} | **\${leadEsc && leadEsc.name ? leadEsc.name : "-"}**: \${leadEsc && leadEsc.effect ? leadEsc.effect : "-"} |`,
    );
    if (supportingAdversary) {
      lines.push(
        `| Supporting | **\${supportingAdversary.title || supportingAdversary.name}** | \${supportingLevel} → \${supportingLevel} | **\${suppEsc && suppEsc.name ? suppEsc.name : "-"}**: \${suppEsc && suppEsc.effect ? suppEsc.effect : "-"} |`,
      );
    } else {
      lines.push(`| Supporting | - | - | - |`);
    }
    lines.push("");
    // Combined difficulty and fear deck
    lines.push("### Combined Values");
    lines.push("");
    lines.push(
      "| Combined Difficulty | Fear Deck Modifications (Stage I, II, III) |",
    );
    lines.push("| --- | --- |");
    lines.push(`| **${combinedDifficulty}** | [${fearCombined.join(", ")}] |`);
    lines.push("");
    // Loss conditions
    lines.push("### Loss Conditions");
    lines.push("");
    if (leadLoss) {
      lines.push(`- **Leading:** **${leadLoss.name}** - ${leadLoss.effect}`);
    }
    if (suppLoss) {
      lines.push(`- **Supporting:** **${suppLoss.name}** - ${suppLoss.effect}`);
    }
    if (!leadLoss && !suppLoss) {
      lines.push("- None.");
    }
    lines.push("");
    // Deck modifications
    lines.push("### Invader Deck Modifications");
    lines.push("");
    lines.push(`- **Leading (stage 2):** ${leadDeckModDesc}`);
    lines.push(`- **Supporting (stage 3):** ${suppDeckModDesc}`);
    lines.push("");
    // Rules: provide each adversary's rules in subsections
    lines.push("### Rules - Leading");
    lines.push("");
    if (leadRules.length === 0) {
      lines.push("- None.");
    } else {
      for (const r of leadRules) {
        lines.push(`- **${r.index}. ${r.name}:** ${r.effect}`);
      }
    }
    lines.push("");
    if (supportingAdversary) {
      lines.push("### Rules - Supporting");
      lines.push("");
      if (suppRules.length === 0) {
        lines.push("- None.");
      } else {
        for (const r of suppRules) {
          lines.push(`- **${r.index}. ${r.name}:** ${r.effect}`);
        }
      }
      lines.push("");
    }

    const message = lines.join("\n");

    // Send the composed message
    return msg.reply(message);
  },
};
