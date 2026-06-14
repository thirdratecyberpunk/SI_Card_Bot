const { createCanvas } = require("canvas");

/**
 * Renders a PNG adversary card in a wiki‑style layout.
 * Includes header, fear deck summary, invader deck summary,
 * dynamic loss conditions, dynamic escalations, and dynamic rules.
 */
async function renderAdversaryCard(data) {
  const {
    leadingAdversary,
    leadingLevel,
    supportingAdversary,
    supportingLevel,
    combinedDifficulty,
    leadEsc,
    suppEsc,
    leadLoss,
    suppLoss,
    leadRules,
    suppRules,
    fearDeck,
    invaderDeck,
  } = data;

  const width = 1600;
  const padding = 30;

  // --- NULL‑SAFE NORMALIZATION ---
  const safeLeadLoss = leadLoss ?? {
    name: "None",
    effect: "This adversary has no special loss condition.",
  };

  const safeSuppLoss = suppLoss ?? null;

  const safeLeadEsc = leadEsc ?? {
    name: "None",
    effect: "This adversary has no escalation.",
  };

  const safeSuppEsc = suppEsc ?? null;

  // --- TEXT MEASUREMENT SETUP ---
  const temp = createCanvas(10, 10);
  const measure = temp.getContext("2d");
  measure.font = "26px 'Noto Sans'";

  function wrap(text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let current = "";

    for (const w of words) {
      const test = current ? current + " " + w : w;
      if (measure.measureText(test).width > maxWidth) {
        lines.push(current);
        current = w;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  // --- BUILD RULES TEXT ---
  const rulesText = [
    ...leadRules.map((r) => `• ${r.name}: ${r.effect}`),
    ...suppRules.map((r) => `• ${r.name}: ${r.effect}`),
  ];

  const wrappedRules = rulesText.flatMap((line) =>
    wrap(line, width - padding * 2),
  );

  // --- HEADER HEIGHT ---
  const headerHeight = 120;

  // --- FEAR + INVADER SUMMARY (single shared line, BELOW header box) ---
  const summaryY = headerHeight + 40;

  const fearSummary = `${fearDeck[0]} / ${fearDeck[1]} / ${fearDeck[2]}`;
  const invaderSummary = invaderDeck.formattedDeck();
  const summaryFont = "28px 'Noto Sans'";

  // --- LOSS CONDITIONS (dynamic height) ---
  const lossBoxWidth = width * 0.45;

  const leadLossWrapped = wrap(
    `Leading: ${safeLeadLoss.name} — ${safeLeadLoss.effect}`,
    lossBoxWidth - padding * 2,
  );

  let suppLossWrapped = [];
  if (safeSuppLoss) {
    suppLossWrapped = wrap(
      `Supporting: ${safeSuppLoss.name} — ${safeSuppLoss.effect}`,
      lossBoxWidth - padding * 2,
    );
  }

  const lossTextLines = leadLossWrapped.length + suppLossWrapped.length;
  const lossHeight = 80 + lossTextLines * 30 + padding;

  // --- ESCALATIONS (dynamic height) ---
  const escBoxWidth = width * 0.55;

  const leadEscWrapped = wrap(
    `Stage II — ${safeLeadEsc.name}: ${safeLeadEsc.effect}`,
    escBoxWidth - padding * 2,
  );

  let suppEscWrapped = [];
  if (safeSuppEsc) {
    suppEscWrapped = wrap(
      `Stage III — ${safeSuppEsc.name}: ${safeSuppEsc.effect}`,
      escBoxWidth - padding * 2,
    );
  }

  const escTextLines = leadEscWrapped.length + suppEscWrapped.length;
  const escHeight = 80 + escTextLines * 30 + padding;

  // --- RULES HEIGHT ---
  const rulesHeight = 80 + wrappedRules.length * 34 + padding;

  // --- STACKING ORDER ---
  const lossEscHeight = Math.max(lossHeight, escHeight);
  const summaryHeight = 40;

  const totalHeight =
    headerHeight +
    summaryHeight +
    40 +
    lossEscHeight +
    padding +
    rulesHeight +
    padding * 2;

  // --- CREATE CANVAS ---
  const canvas = createCanvas(width, totalHeight);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#fdf7e3";
  ctx.fillRect(0, 0, width, totalHeight);

  // --- HEADER BOX ---
  ctx.fillStyle = "rgb(225,220,190)";
  ctx.fillRect(0, 0, width, headerHeight);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, width, headerHeight);

  // --- HEADER TITLE + DIFFICULTY WITH OVERLAP CHECK ---
  const headerTitle =
    `${leadingAdversary.name} ${leadingLevel}` +
    (supportingAdversary
      ? ` + ${supportingAdversary.name} ${supportingLevel}`
      : "");

  const difficultyText = `Difficulty ${combinedDifficulty}`;

  ctx.font = "bold 40px 'Noto Sans'";
  const titleWidth = ctx.measureText(headerTitle).width;

  ctx.font = "bold 32px 'Noto Sans'";
  const difficultyWidth = ctx.measureText(difficultyText).width;

  const leftX = padding;
  const rightMargin = 60;
  const rightX = width - rightMargin - difficultyWidth;

  const minGap = 40; // minimum gap between end of title and start of difficulty

  const titleY = 70;
  const difficultyYSameLine = 70;
  const difficultyYSecondLine = 105;

  ctx.font = "bold 40px 'Noto Sans'";
  ctx.fillStyle = "#000";
  ctx.fillText(headerTitle, leftX, titleY);

  ctx.font = "bold 32px 'Noto Sans'";

  const titleEndX = leftX + titleWidth;
  const difficultyStartX = rightX;

  if (difficultyStartX - titleEndX >= minGap) {
    // fits on same line without overlap
    ctx.fillText(difficultyText, rightX, difficultyYSameLine);
  } else {
    // move difficulty to second line inside header
    ctx.fillText(difficultyText, rightX, difficultyYSecondLine);
  }

  // --- FEAR (left) + INVADER (right) on same line, BELOW header box ---
  ctx.font = "bold 28px 'Noto Sans'";
  ctx.fillText("Fear Deck:", padding, summaryY);

  ctx.font = summaryFont;
  ctx.fillText(fearSummary, padding + 180, summaryY);

  ctx.font = "bold 28px 'Noto Sans'";
  const invaderLabel = "Invader Deck:";
  const invaderLabelWidth = ctx.measureText(invaderLabel).width;

  const invaderSummaryWidth = ctx.measureText(invaderSummary).width;
  const invaderLabelX =
    width - rightMargin - invaderLabelWidth - 20 - invaderSummaryWidth;

  ctx.fillText(invaderLabel, invaderLabelX, summaryY);

  ctx.font = summaryFont;
  ctx.fillText(
    invaderSummary,
    width - rightMargin - invaderSummaryWidth,
    summaryY,
  );

  // --- LOSS CONDITIONS BOX ---
  const lossY = summaryY + summaryHeight;

  ctx.fillStyle = "rgb(235,230,215)";
  ctx.fillRect(0, lossY, lossBoxWidth, lossHeight);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 6;
  ctx.strokeRect(0, lossY, lossBoxWidth, lossHeight);

  ctx.font = "bold italic 28px 'Noto Sans'";
  ctx.fillStyle = "#000";
  ctx.fillText("Loss Conditions", padding, lossY + 40);

  ctx.font = "24px 'Noto Sans'";
  let lossOffset = lossY + 80;

  leadLossWrapped.forEach((line, i) => {
    ctx.fillText(line, padding, lossOffset + i * 30);
  });

  lossOffset += leadLossWrapped.length * 30 + 20;

  suppLossWrapped.forEach((line, i) => {
    ctx.fillText(line, padding, lossOffset + i * 30);
  });

  // --- ESCALATIONS BOX ---
  const escY = lossY;

  ctx.fillStyle = "rgb(235,230,215)";
  ctx.fillRect(lossBoxWidth, escY, escBoxWidth, escHeight);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 6;
  ctx.strokeRect(lossBoxWidth, escY, escBoxWidth, escHeight);

  ctx.font = "bold italic 28px 'Noto Sans'";
  ctx.fillStyle = "#000";
  ctx.fillText("Escalations", lossBoxWidth + padding, escY + 40);

  ctx.font = "24px 'Noto Sans'";
  let escOffset = escY + 80;

  leadEscWrapped.forEach((line, i) => {
    ctx.fillText(line, lossBoxWidth + padding, escOffset + i * 30);
  });

  escOffset += leadEscWrapped.length * 30 + 20;

  suppEscWrapped.forEach((line, i) => {
    ctx.fillText(line, lossBoxWidth + padding, escOffset + i * 30);
  });

  // --- RULES SECTION ---
  const rulesY = lossY + lossEscHeight + padding;

  ctx.fillStyle = "rgb(235,230,215)";
  ctx.fillRect(0, rulesY, width, rulesHeight);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 6;
  ctx.strokeRect(0, rulesY, width, rulesHeight);

  ctx.font = "bold italic 28px 'Noto Sans'";
  ctx.fillStyle = "#000";
  ctx.fillText("Rules", padding, rulesY + 40);

  ctx.font = "24px 'Noto Sans'";
  wrappedRules.forEach((line, i) => {
    ctx.fillText(line, padding, rulesY + 80 + i * 30);
  });

  return canvas.toBuffer("image/png");
}

module.exports = { renderAdversaryCard };
