const path = require("path");
const { createCanvas, registerFont, loadImage } = require("canvas");

registerFont(
  path.join(__dirname, "..", "fonts", "Oswald-VariableFont_wght.ttf"),
  { family: "Oswald Light", weight: "300" },
);
registerFont(
  path.join(__dirname, "..", "fonts", "ReemKufi-VariableFont_wght.ttf"),
  { family: "Reem Kufi" },
);

const TITLE_FONT_FAMILY = "'Oswald Light'";
const BODY_FONT_FAMILY = "'Reem Kufi'";

const HEADER_FILL = "#e1dcbe";
const BORDER_COLOR = "#917d64";
const BORDER_WIDTH = 8;

const FLAG_HEIGHT = 70;
const FLAG_GAP = 14;
const FLAG_DIFFICULTY_GAP = 24;

async function loadFlagImage(flagImagePath) {
  if (!flagImagePath) return null;
  try {
    return await loadImage(path.join(__dirname, "..", flagImagePath));
  } catch (err) {
    console.error(`Failed to load flag image: ${flagImagePath}`, err);
    return null;
  }
}

// Reem Kufi has no italic style, so italics are faked with a horizontal shear.
const ITALIC_SLANT = -0.22;
function fillItalicText(ctx, text, x, y) {
  ctx.save();
  ctx.transform(1, 0, ITALIC_SLANT, 1, 0, 0);
  ctx.fillText(text, x - ITALIC_SLANT * y, y);
  ctx.restore();
}

/**
 * Draws text at (x, y), italicising any parenthesised "(...)" spans.
 * startInParen lets a bracketed span continue across a wrapped line break.
 * Returns whether the line ended mid-bracket, for the next line to pick up.
 */
function drawParenAwareText(ctx, text, x, y, startInParen) {
  let cursorX = x;
  let inParen = startInParen;
  let i = 0;

  while (i < text.length) {
    if (!inParen) {
      const idx = text.indexOf("(", i);
      const end = idx === -1 ? text.length : idx;
      const segment = text.slice(i, end);
      if (segment) {
        ctx.fillText(segment, cursorX, y);
        cursorX += ctx.measureText(segment).width;
      }
      if (idx === -1) break;
      i = idx;
      inParen = true;
    } else {
      const idx = text.indexOf(")", i);
      const end = idx === -1 ? text.length : idx + 1;
      const segment = text.slice(i, end);
      if (segment) {
        fillItalicText(ctx, segment, cursorX, y);
        cursorX += ctx.measureText(segment).width;
      }
      if (idx === -1) {
        i = text.length;
        break;
      }
      i = end;
      inParen = false;
    }
  }

  return inParen;
}

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

  // --- FLAG IMAGES (leading, then supporting) ---
  const flagImages = (
    await Promise.all(
      [leadingAdversary?.flagImage, supportingAdversary?.flagImage].map(
        loadFlagImage,
      ),
    )
  ).filter(Boolean);

  const flagWidths = flagImages.map(
    (img) => (FLAG_HEIGHT * img.width) / img.height,
  );
  const flagsTotalWidth = flagWidths.length
    ? flagWidths.reduce((a, b) => a + b, 0) + FLAG_GAP * (flagWidths.length - 1)
    : 0;
  const flagsBlockWidth = flagsTotalWidth
    ? flagsTotalWidth + FLAG_DIFFICULTY_GAP
    : 0;

  // --- TEXT MEASUREMENT SETUP ---
  const temp = createCanvas(10, 10);
  const measure = temp.getContext("2d");
  measure.font = `26px ${BODY_FONT_FAMILY}`;

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

  const wrappedRuleGroups = rulesText.map((line) =>
    wrap(line, width - padding * 2),
  );
  const wrappedRules = wrappedRuleGroups.flat();

  // --- HEADER HEIGHT ---
  const headerHeight = 120;

  // --- FEAR + INVADER SUMMARY (single shared line, BELOW header box) ---
  const summaryY = headerHeight + 40;

  const fearSummary = `${fearDeck[0]} / ${fearDeck[1]} / ${fearDeck[2]}`;
  const invaderSummary = invaderDeck.formattedDeck();
  const summaryFont = `28px ${BODY_FONT_FAMILY}`;

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
  const rulesHeight = 80 + wrappedRules.length * 30;

  // --- STACKING ORDER ---
  const lossEscHeight = Math.max(lossHeight, escHeight);
  const summaryHeight = 40;

  const totalHeight =
    headerHeight + summaryHeight + 40 + lossEscHeight + rulesHeight;

  // --- CREATE CANVAS ---
  const canvas = createCanvas(width, totalHeight);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#fdf7e3";
  ctx.fillRect(0, 0, width, totalHeight);

  // --- HEADER BOX ---
  ctx.fillStyle = HEADER_FILL;
  ctx.fillRect(0, 0, width, headerHeight);

  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeRect(0, 0, width, headerHeight);

  // --- HEADER TITLE + DIFFICULTY WITH OVERLAP CHECK ---
  const headerTitle = (
    `${leadingAdversary.name} ${leadingLevel}` +
    (supportingAdversary
      ? ` + ${supportingAdversary.name} ${supportingLevel}`
      : "")
  ).toUpperCase();

  const difficultyText = `Difficulty ${combinedDifficulty}`;

  ctx.font = `bold 32px ${BODY_FONT_FAMILY}`;
  const difficultyWidth = ctx.measureText(difficultyText).width;

  const leftX = padding;
  const rightMargin = 60;
  const rightBlockWidth = flagsBlockWidth + difficultyWidth;
  const rightBlockStartX = width - rightMargin - rightBlockWidth;
  const rightX = rightBlockStartX + flagsBlockWidth;

  const minGap = 40; // minimum gap between end of title and start of the flags/difficulty block

  // Shrink the title font as needed so a long combined title never runs into
  // the flags/difficulty block, which is always drawn at a fixed position.
  const maxTitleWidth = rightBlockStartX - leftX - minGap;
  const MIN_TITLE_FONT_SIZE = 24;
  let titleFontSize = 40;
  ctx.font = `${titleFontSize}px ${TITLE_FONT_FAMILY}`;
  let titleWidth = ctx.measureText(headerTitle).width;
  while (titleWidth > maxTitleWidth && titleFontSize > MIN_TITLE_FONT_SIZE) {
    titleFontSize -= 1;
    ctx.font = `${titleFontSize}px ${TITLE_FONT_FAMILY}`;
    titleWidth = ctx.measureText(headerTitle).width;
  }

  const titleY = 70;
  const difficultyYSameLine = 70;
  const difficultyYSecondLine = 105;

  ctx.font = `${titleFontSize}px ${TITLE_FONT_FAMILY}`;
  ctx.fillStyle = "#000";
  ctx.fillText(headerTitle, leftX, titleY);

  // Flags sit just before the difficulty text, in leading-then-supporting order,
  // vertically centered in the header regardless of which line the difficulty lands on.
  const flagY = (headerHeight - FLAG_HEIGHT) / 2;
  let flagX = rightBlockStartX;
  flagImages.forEach((img, i) => {
    const w = flagWidths[i];
    ctx.drawImage(img, flagX, flagY, w, FLAG_HEIGHT);
    flagX += w + FLAG_GAP;
  });

  ctx.font = `bold 32px ${BODY_FONT_FAMILY}`;

  const titleEndX = leftX + titleWidth;
  const difficultyStartX = rightBlockStartX;

  if (difficultyStartX - titleEndX >= minGap) {
    // fits on same line without overlap
    ctx.fillText(difficultyText, rightX, difficultyYSameLine);
  } else {
    // move difficulty to second line inside header
    ctx.fillText(difficultyText, rightX, difficultyYSecondLine);
  }

  // --- FEAR (left) + INVADER (right) on same line, BELOW header box ---
  ctx.font = `bold 28px ${BODY_FONT_FAMILY}`;
  ctx.fillText("Fear Deck:", padding, summaryY);

  ctx.font = summaryFont;
  ctx.fillText(fearSummary, padding + 180, summaryY);

  ctx.font = `bold 28px ${BODY_FONT_FAMILY}`;
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
  ctx.fillRect(0, lossY, lossBoxWidth, lossEscHeight);

  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeRect(0, lossY, lossBoxWidth, lossEscHeight);

  ctx.font = `bold 28px ${BODY_FONT_FAMILY}`;
  ctx.fillStyle = "#000";
  fillItalicText(ctx, "Loss Conditions", padding, lossY + 40);

  ctx.font = `24px ${BODY_FONT_FAMILY}`;
  let lossOffset = lossY + 80;
  let lossParenState = false;

  leadLossWrapped.forEach((line, i) => {
    lossParenState = drawParenAwareText(
      ctx,
      line,
      padding,
      lossOffset + i * 30,
      lossParenState,
    );
  });

  lossOffset += leadLossWrapped.length * 30 + 20;
  lossParenState = false;

  suppLossWrapped.forEach((line, i) => {
    lossParenState = drawParenAwareText(
      ctx,
      line,
      padding,
      lossOffset + i * 30,
      lossParenState,
    );
  });

  // --- ESCALATIONS BOX ---
  const escY = lossY;

  ctx.fillStyle = "rgb(235,230,215)";
  ctx.fillRect(lossBoxWidth, escY, escBoxWidth, lossEscHeight);

  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeRect(lossBoxWidth, escY, escBoxWidth, lossEscHeight);

  ctx.font = `bold 28px ${BODY_FONT_FAMILY}`;
  ctx.fillStyle = "#000";
  fillItalicText(ctx, "Escalations", lossBoxWidth + padding, escY + 40);

  ctx.font = `24px ${BODY_FONT_FAMILY}`;
  let escOffset = escY + 80;
  let escParenState = false;

  leadEscWrapped.forEach((line, i) => {
    escParenState = drawParenAwareText(
      ctx,
      line,
      lossBoxWidth + padding,
      escOffset + i * 30,
      escParenState,
    );
  });

  escOffset += leadEscWrapped.length * 30 + 20;
  escParenState = false;

  suppEscWrapped.forEach((line, i) => {
    escParenState = drawParenAwareText(
      ctx,
      line,
      lossBoxWidth + padding,
      escOffset + i * 30,
      escParenState,
    );
  });

  // --- RULES SECTION ---
  const rulesY = lossY + lossEscHeight;

  ctx.fillStyle = "rgb(235,230,215)";
  ctx.fillRect(0, rulesY, width, rulesHeight);

  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeRect(0, rulesY, width, rulesHeight);

  ctx.font = `bold 28px ${BODY_FONT_FAMILY}`;
  ctx.fillStyle = "#000";
  fillItalicText(ctx, "Rules", padding, rulesY + 40);

  ctx.font = `24px ${BODY_FONT_FAMILY}`;
  let ruleLineIndex = 0;
  wrappedRuleGroups.forEach((group) => {
    let ruleParenState = false;
    group.forEach((line) => {
      ruleParenState = drawParenAwareText(
        ctx,
        line,
        padding,
        rulesY + 80 + ruleLineIndex * 30,
        ruleParenState,
      );
      ruleLineIndex += 1;
    });
  });

  return canvas.toBuffer("image/png");
}

module.exports = { renderAdversaryCard };
