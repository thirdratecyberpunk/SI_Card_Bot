const path = require("path");
const fs = require("fs");
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

async function loadFlagImage(flagImagePath) {
  if (!flagImagePath) return null;
  try {
    return await loadImage(path.join(__dirname, "..", flagImagePath));
  } catch (err) {
    console.error(`Failed to load flag image: ${flagImagePath}`, err);
    return null;
  }
}

// --- ICON TOKENS: ":InvaderCity:"-style tokens in rules text render as inline icons ---
const ICONS_DIR = path.join(__dirname, "..", "images", "icons");
const ICON_SIZE = 26;
const ICON_GAP = 4;
const ICON_TOKEN_PREFIXES = ["invader", "token", "speed"];

// "36px-Fasticon.png" -> "fast", "25px-Isolateicon.png" -> "isolate", "City.svg" -> "city"
function normalizeIconKey(fileName) {
  const base = fileName.replace(/\.[^.]+$/, "");
  const withoutSizePrefix = base.replace(/^\d+px-/i, "");
  const withoutIconSuffix = withoutSizePrefix.replace(/icon$/i, "");
  return (withoutIconSuffix || withoutSizePrefix).toLowerCase();
}

function buildIconLookup() {
  const lookup = {};
  let files = [];
  try {
    files = fs.readdirSync(ICONS_DIR);
  } catch (err) {
    console.error(`Failed to read icons directory: ${ICONS_DIR}`, err);
  }
  for (const file of files) {
    lookup[normalizeIconKey(file)] = path.join(ICONS_DIR, file);
  }
  return lookup;
}

const ICON_LOOKUP = buildIconLookup();

// Resolves a ":TokenName:" reference (e.g. "InvaderCity") to an icon file path,
// stripping common game-text prefixes ("Invader"/"Token"/"Speed") when the bare
// name doesn't match directly. Returns null when there's no icon for it yet.
function resolveIconPath(tokenName) {
  const key = tokenName.toLowerCase();
  if (ICON_LOOKUP[key]) return ICON_LOOKUP[key];
  for (const prefix of ICON_TOKEN_PREFIXES) {
    if (key.startsWith(prefix) && key.length > prefix.length) {
      const stripped = key.slice(prefix.length);
      if (ICON_LOOKUP[stripped]) return ICON_LOOKUP[stripped];
    }
  }
  return null;
}

const iconImageCache = new Map();

async function preloadIcons(filePaths) {
  await Promise.all(
    filePaths.map(async (filePath) => {
      if (iconImageCache.has(filePath)) return;
      try {
        iconImageCache.set(filePath, await loadImage(filePath));
      } catch (err) {
        console.error(`Failed to load icon image: ${filePath}`, err);
      }
    }),
  );
}

/**
 * Splits a chunk of text into alternating text/icon runs based on any
 * ":TokenName:" references that resolve to a known icon. Tokens with no
 * matching icon are left as literal text.
 */
function extractIconRuns(str) {
  const runs = [];
  const re = /:([A-Za-z]+):/g;
  let lastIndex = 0;
  let match;

  while ((match = re.exec(str)) !== null) {
    const iconFile = resolveIconPath(match[1]);
    if (iconFile) {
      if (match.index > lastIndex) {
        runs.push({ type: "text", str: str.slice(lastIndex, match.index) });
      }
      runs.push({ type: "icon", file: iconFile, raw: match[0] });
      lastIndex = re.lastIndex;
    }
  }
  if (lastIndex < str.length) {
    runs.push({ type: "text", str: str.slice(lastIndex) });
  }
  return runs;
}

// Reem Kufi has no italic style, so italics are faked with a horizontal shear.
// Both text and icons shear around the line's baseline y so a mixed run of
// text + icons stays visually consistent instead of stair-stepping.
const ITALIC_SLANT = -0.22;
function fillItalicText(ctx, text, x, y) {
  ctx.save();
  ctx.transform(1, 0, ITALIC_SLANT, 1, 0, 0);
  ctx.fillText(text, x - ITALIC_SLANT * y, y);
  ctx.restore();
}

// Reem Kufi's registered face is fairly thick even at "regular" weight, so the
// CSS "bold" keyword alone doesn't read as clearly bold. Stroke-then-fill gives
// section/box titles a reliably heavier weight regardless of font quirks.
function fillBoldText(ctx, text, x, y) {
  ctx.save();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = ctx.fillStyle;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
  ctx.restore();
}

function fillBoldItalicText(ctx, text, x, y) {
  ctx.save();
  ctx.transform(1, 0, ITALIC_SLANT, 1, 0, 0);
  const shearedX = x - ITALIC_SLANT * y;
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = ctx.fillStyle;
  ctx.strokeText(text, shearedX, y);
  ctx.fillText(text, shearedX, y);
  ctx.restore();
}

function drawIconSlanted(ctx, img, x, iconTopY, w, h, baselineY) {
  ctx.save();
  ctx.transform(1, 0, ITALIC_SLANT, 1, 0, 0);
  ctx.drawImage(img, x - ITALIC_SLANT * baselineY, iconTopY, w, h);
  ctx.restore();
}

function drawTextRun(ctx, str, x, y, italic) {
  if (!str) return x;
  if (italic) {
    fillItalicText(ctx, str, x, y);
  } else {
    ctx.fillText(str, x, y);
  }
  return x + ctx.measureText(str).width;
}

// Draws a run of same-styled text, substituting any ":TokenName:" reference
// with its icon inline, scaled to the source image's own aspect ratio.
// Icons are slanted the same as the surrounding text when inside a bracket.
function drawChunkWithIcons(ctx, chunk, x, y, italic) {
  let cursorX = x;
  for (const run of extractIconRuns(chunk)) {
    if (run.type === "icon") {
      const img = iconImageCache.get(run.file);
      if (img) {
        const h = ICON_SIZE;
        const w = img.height ? h * (img.width / img.height) : h;
        const iconY = y - ICON_SIZE * 0.78;
        if (italic) {
          drawIconSlanted(ctx, img, cursorX, iconY, w, h, y);
        } else {
          ctx.drawImage(img, cursorX, iconY, w, h);
        }
        cursorX += w + ICON_GAP;
      } else {
        cursorX = drawTextRun(ctx, run.raw, cursorX, y, italic);
      }
    } else {
      cursorX = drawTextRun(ctx, run.str, cursorX, y, italic);
    }
  }
  return cursorX;
}

/**
 * Draws text at (x, y), italicising any parenthesised "(...)" spans and
 * replacing any ":TokenName:" reference with its icon.
 * startInParen lets a bracketed span continue across a wrapped line break.
 * Returns whether the line ended mid-bracket, for the next line to pick up.
 */
function drawRichLine(ctx, text, x, y, startInParen) {
  let cursorX = x;
  let inParen = startInParen;
  let i = 0;

  while (i < text.length) {
    if (!inParen) {
      const idx = text.indexOf("(", i);
      const end = idx === -1 ? text.length : idx;
      const chunk = text.slice(i, end);
      if (chunk) {
        cursorX = drawChunkWithIcons(ctx, chunk, cursorX, y, false);
      }
      if (idx === -1) break;
      i = idx;
      inParen = true;
    } else {
      const idx = text.indexOf(")", i);
      const end = idx === -1 ? text.length : idx + 1;
      const chunk = text.slice(i, end);
      if (chunk) {
        cursorX = drawChunkWithIcons(ctx, chunk, cursorX, y, true);
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

// Draws one line of a "{Name}: effect" / "{Name} — effect" group, bolding the
// name prefix on the first line only. Returns the paren state for the next line.
function drawNamedEffectLine(ctx, line, x, y, boldPrefixLength, isFirstLine, parenState) {
  if (isFirstLine && boldPrefixLength > 0) {
    const boldLen = Math.min(boldPrefixLength, line.length);
    const namePart = line.slice(0, boldLen);
    const restPart = line.slice(boldLen);
    fillBoldText(ctx, namePart, x, y);
    const namePartWidth = ctx.measureText(namePart).width;
    return drawRichLine(ctx, restPart, x + namePartWidth, y, false);
  }
  return drawRichLine(ctx, line, x, y, parenState);
}

// Draws the " — {Name}: effect" remainder of an escalation's first line,
// bolding "{Name}:" as well (the "Stage II"/"Stage III" part is drawn by the
// caller before this). Falls back to plain rendering if the text doesn't
// start with the expected " — {escName}:" shape (e.g. an unexpected wrap).
function drawEscalationNameEffect(ctx, text, x, y, escName) {
  const combinedPrefix = ` — ${escName}:`;
  if (text.startsWith(combinedPrefix)) {
    let cursorX = x;
    const dash = " — ";
    ctx.fillText(dash, cursorX, y);
    cursorX += ctx.measureText(dash).width;

    const namePart = `${escName}:`;
    fillBoldText(ctx, namePart, cursorX, y);
    cursorX += ctx.measureText(namePart).width;

    return drawRichLine(ctx, text.slice(combinedPrefix.length), cursorX, y, false);
  }
  return drawRichLine(ctx, text, x, y, false);
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

  // No loss condition at all (neither adversary has one) -> the whole box is omitted.
  // An adversary that individually lacks one is simply left out, not shown as "None".
  const hasLossConditions = Boolean(leadLoss) || Boolean(suppLoss);

  // --- NULL‑SAFE NORMALIZATION ---
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
  const flagsBlockWidth = flagWidths.length
    ? flagWidths.reduce((a, b) => a + b, 0) + FLAG_GAP * (flagWidths.length - 1)
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

  // Wraps "{namePrefix}{effect}" and records how many characters of the
  // first line are the name, so the renderer can draw just that part bold.
  function wrapNamedEffect(namePrefix, effect, maxWidth) {
    const lines = wrap(`${namePrefix}${effect}`, maxWidth);
    return { lines, boldPrefixLength: namePrefix.length };
  }

  // --- BUILD RULES TEXT, GROUPED INTO PHASE SECTIONS ---
  // A rule can belong to more than one phase (type is an array), in which
  // case it's shown in full under each relevant section.
  const RULE_SECTION_ORDER = [
    { key: "setup", label: "Setup" },
    { key: "ongoing", label: "Ongoing" },
    { key: "explore", label: "Explore" },
    { key: "build", label: "Build" },
    { key: "ravage", label: "Ravage" },
  ];

  const allRules = [...leadRules, ...suppRules];

  const ruleSections = RULE_SECTION_ORDER.map(({ key, label }) => {
    const rulesForSection = allRules.filter((r) =>
      (r.type && r.type.length ? r.type : ["ongoing"]).includes(key),
    );
    const wrappedGroups = rulesForSection.map((r) =>
      wrapNamedEffect(`• ${r.name}: `, r.effect, width - padding * 2),
    );
    return { label, wrappedGroups };
  }).filter((section) => section.wrappedGroups.length > 0);

  const wrappedRules = ruleSections.flatMap((section) =>
    section.wrappedGroups.flatMap((group) => group.lines),
  );

  // --- HEADER HEIGHT ---
  const headerHeight = 120;

  // --- FEAR + INVADER SUMMARY (single shared line, BELOW header box) ---
  const summaryY = headerHeight + 40;

  const fearSummary = `${fearDeck[0]} / ${fearDeck[1]} / ${fearDeck[2]}`;
  const invaderSummary = invaderDeck.formattedDeck();
  const summaryFont = `28px ${BODY_FONT_FAMILY}`;

  // --- LOSS CONDITIONS (dynamic height, omitted entirely if neither adversary has one) ---
  const lossBoxWidth = width * 0.45;

  let leadLossGroup = null;
  let suppLossGroup = null;
  let lossHeight = 0;

  if (hasLossConditions) {
    if (leadLoss) {
      leadLossGroup = wrapNamedEffect(
        `${leadLoss.name} — `,
        leadLoss.effect,
        lossBoxWidth - padding * 2,
      );
    }

    if (suppLoss) {
      suppLossGroup = wrapNamedEffect(
        `${suppLoss.name} — `,
        suppLoss.effect,
        lossBoxWidth - padding * 2,
      );
    }

    const lossTextLines =
      (leadLossGroup ? leadLossGroup.lines.length : 0) +
      (suppLossGroup ? suppLossGroup.lines.length : 0);
    lossHeight = 80 + lossTextLines * 30 + padding;
  }

  // --- ESCALATIONS (dynamic height) ---
  // Escalations takes the full row width when there's no Loss Conditions box beside it.
  const escBoxWidth = hasLossConditions ? width * 0.55 : width;
  const escX = hasLossConditions ? lossBoxWidth : 0;

  const leadEscGroup = wrapNamedEffect(
    "Stage II",
    ` — ${safeLeadEsc.name}: ${safeLeadEsc.effect}`,
    escBoxWidth - padding * 2,
  );

  let suppEscGroup = null;
  if (safeSuppEsc) {
    suppEscGroup = wrapNamedEffect(
      "Stage III",
      ` — ${safeSuppEsc.name}: ${safeSuppEsc.effect}`,
      escBoxWidth - padding * 2,
    );
  }

  const escTextLines =
    leadEscGroup.lines.length + (suppEscGroup ? suppEscGroup.lines.length : 0);
  const escHeight = 80 + escTextLines * 30 + padding;

  // --- RULES HEIGHT ---
  // Each section reserves space for its subheading, then one line per
  // wrapped rule line, plus a gap (with a divider) between sections.
  const RULE_SECTION_HEADER_HEIGHT = 34;
  const RULE_SECTION_GAP = 36;

  const rulesInnerHeight =
    ruleSections.reduce((sum, section) => {
      const lineCount = section.wrappedGroups.reduce(
        (n, group) => n + group.lines.length,
        0,
      );
      return sum + RULE_SECTION_HEADER_HEIGHT + lineCount * 30;
    }, 0) +
    RULE_SECTION_GAP * Math.max(ruleSections.length - 1, 0);

  // No rules to show (e.g. noSetup hid everything) -> the whole box collapses away.
  const rulesHeight = ruleSections.length > 0 ? 80 + rulesInnerHeight : 0;

  // --- ICONS: preload any referenced by the loss/escalation/rules text ---
  const bodyLines = [
    ...(leadLossGroup ? leadLossGroup.lines : []),
    ...(suppLossGroup ? suppLossGroup.lines : []),
    ...leadEscGroup.lines,
    ...(suppEscGroup ? suppEscGroup.lines : []),
    ...wrappedRules,
  ];
  const neededIconFiles = new Set();
  for (const line of bodyLines) {
    for (const run of extractIconRuns(line)) {
      if (run.type === "icon") neededIconFiles.add(run.file);
    }
  }
  const escalationIconFile = resolveIconPath("Escalation");
  if (escalationIconFile) neededIconFiles.add(escalationIconFile);
  await preloadIcons([...neededIconFiles]);

  // --- STACKING ORDER ---
  const lossEscHeight = hasLossConditions ? Math.max(lossHeight, escHeight) : escHeight;
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

  // --- HEADER TITLE + FLAGS ---
  const headerTitle = (
    `${leadingAdversary.name} ${leadingLevel}` +
    (supportingAdversary
      ? ` + ${supportingAdversary.name} ${supportingLevel}`
      : "")
  ).toUpperCase();

  const leftX = padding;
  const rightMargin = 60;
  // Flags sit as close to the header's right edge as the card border allows.
  const rightBlockStartX = width - padding - flagsBlockWidth;

  const minGap = 40; // minimum gap between end of title and start of the flags block

  // Shrink the title font as needed so a long combined title never runs into
  // the flags, which are always drawn at a fixed position.
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

  ctx.font = `${titleFontSize}px ${TITLE_FONT_FAMILY}`;
  ctx.fillStyle = "#000";
  ctx.fillText(headerTitle, leftX, titleY);

  // Flags sit right-aligned in the header, vertically centered.
  const flagY = (headerHeight - FLAG_HEIGHT) / 2;
  let flagX = rightBlockStartX;
  flagImages.forEach((img, i) => {
    const w = flagWidths[i];
    ctx.drawImage(img, flagX, flagY, w, FLAG_HEIGHT);
    flagX += w + FLAG_GAP;
  });

  // --- SUMMARY ROW: Difficulty (left) / Fear Deck (center) / Invader Deck (right) ---
  ctx.fillStyle = "#000";

  // Difficulty — leftmost
  ctx.font = `28px ${BODY_FONT_FAMILY}`;
  const difficultyLabel = "Difficulty";
  fillBoldText(ctx, difficultyLabel, padding, summaryY);
  const difficultyLabelWidth = ctx.measureText(difficultyLabel).width;

  ctx.font = summaryFont;
  const difficultyValueText = `${combinedDifficulty}`;
  ctx.fillText(difficultyValueText, padding + difficultyLabelWidth + 10, summaryY);
  const difficultyValueWidth = ctx.measureText(difficultyValueText).width;
  const difficultyGroupEndX = padding + difficultyLabelWidth + 10 + difficultyValueWidth;

  // Invader Deck — rightmost
  ctx.font = `28px ${BODY_FONT_FAMILY}`;
  const invaderLabel = "Invader Deck:";
  const invaderLabelWidth = ctx.measureText(invaderLabel).width;

  ctx.font = summaryFont;
  const invaderSummaryWidth = ctx.measureText(invaderSummary).width;
  const invaderLabelX =
    width - rightMargin - invaderLabelWidth - 20 - invaderSummaryWidth;

  ctx.font = `28px ${BODY_FONT_FAMILY}`;
  fillBoldText(ctx, invaderLabel, invaderLabelX, summaryY);

  ctx.font = summaryFont;
  ctx.fillText(
    invaderSummary,
    width - rightMargin - invaderSummaryWidth,
    summaryY,
  );

  // Fear Deck — centered within the free space between Difficulty and
  // Invader Deck (not the full card width), so a long Invader Deck string
  // never gets run into.
  ctx.font = `28px ${BODY_FONT_FAMILY}`;
  const fearLabel = "Fear Deck:";
  const fearLabelWidth = ctx.measureText(fearLabel).width;

  ctx.font = summaryFont;
  const fearSummaryWidth = ctx.measureText(fearSummary).width;

  const fearGroupWidth = fearLabelWidth + 10 + fearSummaryWidth;
  const middleZoneStart = difficultyGroupEndX + 30;
  const middleZoneEnd = invaderLabelX - 30;
  const fearLabelX = Math.max(
    middleZoneStart,
    Math.min(
      middleZoneStart + (middleZoneEnd - middleZoneStart - fearGroupWidth) / 2,
      middleZoneEnd - fearGroupWidth,
    ),
  );

  ctx.font = `28px ${BODY_FONT_FAMILY}`;
  fillBoldText(ctx, fearLabel, fearLabelX, summaryY);

  ctx.font = summaryFont;
  ctx.fillText(fearSummary, fearLabelX + fearLabelWidth + 10, summaryY);

  // --- LOSS CONDITIONS BOX (omitted entirely if neither adversary has one) ---
  const lossY = summaryY + summaryHeight;

  if (hasLossConditions) {
    ctx.fillStyle = "rgb(235,230,215)";
    ctx.fillRect(0, lossY, lossBoxWidth, lossEscHeight);

    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth = BORDER_WIDTH;
    ctx.strokeRect(0, lossY, lossBoxWidth, lossEscHeight);

    ctx.font = `28px ${BODY_FONT_FAMILY}`;
    ctx.fillStyle = "#000";
    fillBoldItalicText(ctx, "Loss Conditions", padding, lossY + 40);

    ctx.font = `24px ${BODY_FONT_FAMILY}`;
    let lossOffset = lossY + 80;

    // Only the adversaries that actually have a loss condition are listed —
    // one that doesn't isn't shown as "None".
    const lossGroups = [leadLossGroup, suppLossGroup].filter(Boolean);
    lossGroups.forEach((group, groupIndex) => {
      let lossParenState = false;
      group.lines.forEach((line, i) => {
        lossParenState = drawNamedEffectLine(
          ctx,
          line,
          padding,
          lossOffset + i * 30,
          group.boldPrefixLength,
          i === 0,
          lossParenState,
        );
      });
      lossOffset += group.lines.length * 30;
      if (groupIndex < lossGroups.length - 1) lossOffset += 20;
    });
  }

  // --- ESCALATIONS BOX ---
  const escY = lossY;

  ctx.fillStyle = "rgb(235,230,215)";
  ctx.fillRect(escX, escY, escBoxWidth, lossEscHeight);

  ctx.strokeStyle = BORDER_COLOR;
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeRect(escX, escY, escBoxWidth, lossEscHeight);

  ctx.font = `28px ${BODY_FONT_FAMILY}`;
  ctx.fillStyle = "#000";
  fillBoldItalicText(ctx, "Escalations", escX + padding, escY + 40);

  ctx.font = `24px ${BODY_FONT_FAMILY}`;
  let escOffset = escY + 80;
  let escParenState = false;

  const escalationIcon = escalationIconFile
    ? iconImageCache.get(escalationIconFile)
    : null;

  leadEscGroup.lines.forEach((line, i) => {
    const lineY = escOffset + i * 30;

    if (i === 0) {
      const boldLen = Math.min(leadEscGroup.boldPrefixLength, line.length);
      const namePart = line.slice(0, boldLen);
      const restPart = line.slice(boldLen);

      let cursorX = escX + padding;
      fillBoldText(ctx, namePart, cursorX, lineY);
      cursorX += ctx.measureText(namePart).width;

      if (escalationIcon) {
        const iconH = ICON_SIZE;
        const iconW = escalationIcon.height
          ? iconH * (escalationIcon.width / escalationIcon.height)
          : iconH;
        cursorX += ICON_GAP;
        ctx.drawImage(escalationIcon, cursorX, lineY - ICON_SIZE * 0.78, iconW, iconH);
        cursorX += iconW + ICON_GAP;
      }

      escParenState = drawEscalationNameEffect(
        ctx,
        restPart,
        cursorX,
        lineY,
        safeLeadEsc.name,
      );
    } else {
      escParenState = drawNamedEffectLine(
        ctx,
        line,
        escX + padding,
        lineY,
        leadEscGroup.boldPrefixLength,
        false,
        escParenState,
      );
    }
  });

  if (suppEscGroup) {
    escOffset += leadEscGroup.lines.length * 30 + 20;
    escParenState = false;

    suppEscGroup.lines.forEach((line, i) => {
      const lineY = escOffset + i * 30;

      if (i === 0) {
        const boldLen = Math.min(suppEscGroup.boldPrefixLength, line.length);
        const namePart = line.slice(0, boldLen);
        const restPart = line.slice(boldLen);

        fillBoldText(ctx, namePart, escX + padding, lineY);
        const cursorX = escX + padding + ctx.measureText(namePart).width;

        escParenState = drawEscalationNameEffect(
          ctx,
          restPart,
          cursorX,
          lineY,
          safeSuppEsc.name,
        );
      } else {
        escParenState = drawNamedEffectLine(
          ctx,
          line,
          escX + padding,
          lineY,
          suppEscGroup.boldPrefixLength,
          false,
          escParenState,
        );
      }
    });
  }

  // --- RULES SECTION (omitted entirely if there's nothing left to show) ---
  const rulesY = lossY + lossEscHeight;

  if (ruleSections.length > 0) {
    ctx.fillStyle = "rgb(235,230,215)";
    ctx.fillRect(0, rulesY, width, rulesHeight);

    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth = BORDER_WIDTH;
    ctx.strokeRect(0, rulesY, width, rulesHeight);

    ctx.font = `28px ${BODY_FONT_FAMILY}`;
    ctx.fillStyle = "#000";
    fillBoldItalicText(ctx, "Rules", padding, rulesY + 40);

    let sectionY = rulesY + 80;
    ruleSections.forEach((section, sectionIndex) => {
      ctx.font = `26px ${BODY_FONT_FAMILY}`;
      ctx.fillStyle = "#000";
      fillBoldText(ctx, section.label, padding, sectionY);
      sectionY += RULE_SECTION_HEADER_HEIGHT;

      ctx.font = `24px ${BODY_FONT_FAMILY}`;
      section.wrappedGroups.forEach((group) => {
        let ruleParenState = false;
        group.lines.forEach((line, lineIndex) => {
          ruleParenState = drawNamedEffectLine(
            ctx,
            line,
            padding,
            sectionY,
            group.boldPrefixLength,
            lineIndex === 0,
            ruleParenState,
          );
          sectionY += 30;
        });
      });

      if (sectionIndex < ruleSections.length - 1) {
        // Bias the divider toward the top of the gap so there's clear padding
        // between the line and the next section's caption below it.
        const dividerY = sectionY + 10;
        ctx.strokeStyle = BORDER_COLOR;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, dividerY);
        ctx.lineTo(width - padding, dividerY);
        ctx.stroke();
        sectionY += RULE_SECTION_GAP;
      }
    });
  }

  return canvas.toBuffer("image/png");
}

module.exports = { renderAdversaryCard };
