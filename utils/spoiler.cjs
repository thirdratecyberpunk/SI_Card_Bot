const SPOILER_WRAP = /^\|\|[\s\S]*\|\|$/;

// SICK (sick.oberien.de) card link, e.g.
// https://sick.oberien.de/imgs/events/promising_venture.webp
const SICK_CARD_LINK =
  /^https:\/\/sick\.oberien\.de\/\S+\.(webp|png|jpe?g|gif)$/i;

function isSickCardLink(text) {
  return typeof text === "string" && SICK_CARD_LINK.test(text.trim());
}

/**
 * Builds the filename Discord requires to blur an attachment: a
 * SPOILER_-prefixed name matching the card image's own filename.
 */
function spoilerAttachmentName(url) {
  const path = new URL(url).pathname;
  const base = path.slice(path.lastIndexOf("/") + 1) || "card.webp";
  return `SPOILER_${base}`;
}

/**
 * Turns a bare SICK card link into a SPOILER_-prefixed attachment payload.
 * Spoilering a plain link's text just suppresses its auto-generated embed
 * outright (no image ever appears, blurred or not) - so the image has to
 * be re-uploaded as a first-party attachment. It must be sent as a bare
 * attachment, NOT wrapped in an embed: Discord only draws the click-to-
 * reveal blur over a standalone attachment card - an embed pointed at the
 * same `attachment://SPOILER_...` file via `image.url` renders the
 * picture in full, blur bypassed entirely.
 */
function spoilerCardAttachmentPayload(url) {
  const name = spoilerAttachmentName(url);
  return {
    files: [{ attachment: url, name }],
  };
}

/**
 * Checks whether a raw message's content is wrapped end-to-end in Discord's
 * spoiler markdown (`||like this||`) - e.g. `||-event promising||` - and
 * returns the content with that wrapper stripped, so prefix/command
 * parsing downstream never has to know spoilers exist.
 */
function extractSpoilerContent(rawContent) {
  const trimmed = (rawContent || "").trim();
  if (trimmed.length < 4 || !SPOILER_WRAP.test(trimmed)) {
    return { isSpoiler: false, content: rawContent };
  }
  return { isSpoiler: true, content: trimmed.slice(2, -2).trim() };
}

/**
 * Wraps a string in spoiler markdown, unless it's empty or already
 * spoilered (avoids `||||text||||` if a command's own output happens to
 * already contain a spoiler tag).
 */
function wrapTextInSpoiler(text) {
  if (typeof text !== "string" || text.length === 0) return text;
  if (SPOILER_WRAP.test(text.trim())) return text;
  return `||${text}||`;
}

function isEmbedLike(value) {
  return (
    !!value &&
    typeof value === "object" &&
    (typeof value.setDescription === "function" ||
      "description" in value ||
      (value.data && "description" in value.data))
  );
}

/**
 * Spoiler-wraps an embed's description in place. Discord doesn't support
 * spoilering an embed's image/thumbnail via markdown, so the description
 * text is the only part of an embed this can meaningfully hide.
 */
function wrapEmbedInSpoiler(embed) {
  if (!isEmbedLike(embed)) return embed;
  const description =
    typeof embed.setDescription === "function"
      ? (embed.data?.description ?? embed.description)
      : (embed.description ?? embed.data?.description);
  if (!description) return embed;

  const spoiled = wrapTextInSpoiler(description);
  if (typeof embed.setDescription === "function") {
    embed.setDescription(spoiled);
  } else if (embed.data) {
    embed.data.description = spoiled;
  } else {
    embed.description = spoiled;
  }
  return embed;
}

/**
 * Transforms an outgoing `channel.send` payload so its visible content is
 * hidden behind spoiler markdown. Handles the payload shapes commands in
 * this bot actually send: a plain string (almost always a card image link
 * - SICK links get turned into a real SPOILER_-prefixed attachment rather
 * than spoilered link text, see spoilerCardAttachmentPayload), a
 * MessageCreateOptions object (`{ content, embeds }`), or a raw embed
 * builder passed directly to `send()`.
 */
function wrapPayloadInSpoiler(payload) {
  if (typeof payload === "string") {
    if (isSickCardLink(payload)) {
      return spoilerCardAttachmentPayload(payload);
    }
    return wrapTextInSpoiler(payload);
  }
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  if ("content" in payload || "embeds" in payload) {
    const wrapped = { ...payload };
    if (typeof wrapped.content === "string") {
      wrapped.content = wrapTextInSpoiler(wrapped.content);
    }
    if (Array.isArray(wrapped.embeds)) {
      wrapped.embeds = wrapped.embeds.map(wrapEmbedInSpoiler);
    }
    return wrapped;
  }

  if (isEmbedLike(payload)) {
    return wrapEmbedInSpoiler(payload);
  }

  return payload;
}

/**
 * Returns a stand-in for `channel` whose `send` spoiler-wraps every
 * outgoing message/embed and otherwise behaves exactly like the real
 * channel. Built with Object.create rather than a Proxy: `send` is the
 * only own property added, everything else is served straight off the
 * real channel's prototype chain, so no other call ever runs with the
 * wrong `this` against discord.js's private class fields.
 */
function spoilerWrappedChannel(channel) {
  const wrapped = Object.create(channel);
  wrapped.send = (payload) => channel.send(wrapPayloadInSpoiler(payload));
  return wrapped;
}

/**
 * Returns a stand-in for `msg` whose `.channel` is spoiler-wrapped (see
 * spoilerWrappedChannel) and every other property/method passes straight
 * through to the real message.
 */
function spoilerWrappedMessage(msg) {
  const wrappedChannel = spoilerWrappedChannel(msg.channel);
  return new Proxy(msg, {
    get(target, prop, receiver) {
      if (prop === "channel") return wrappedChannel;
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

// Commands that support spoiler-wrapping their result. Everything else
// ignores `||...||` wrapping entirely (the wrapped message won't start
// with the command prefix, so the bot just won't recognise it as a
// command) - card lookups and search results are the things worth hiding,
// not e.g. -help or -random.
const SPOILERABLE_COMMANDS = new Set(["search", "event", "fear"]);

/**
 * Reads the command name a (already-unwrapped) message content would
 * dispatch to, without actually dispatching it.
 */
function peekCommandName(content, prefix) {
  if (!content.startsWith(prefix)) return null;
  const withoutPrefix = content.slice(prefix.length).trimStart();
  const end = withoutPrefix.search(/\s/);
  const command = end === -1 ? withoutPrefix : withoutPrefix.slice(0, end);
  return command ? command.toLowerCase() : null;
}

/**
 * Discord bot middleware: if `msg`'s content was sent wrapped in spoiler
 * markdown (e.g. a user typing `||-event promising||` or `||-search Vital
 * Strength of the Earth||`) AND it dispatches to one of
 * SPOILERABLE_COMMANDS, strips the wrapper and hands back a version of the
 * message whose `channel.send` spoiler-tags whatever the matched command
 * sends back. For every other command (spoilered or not) it hands back
 * `msg` untouched, so `-random`/`-help`/etc. behave exactly as if this
 * middleware didn't exist. Callers should parse commands/args from the
 * returned `content` and pass the returned `message` to
 * `command.execute(...)` instead of the original `msg`.
 */
function applySpoilerMiddleware(msg, prefix) {
  const { isSpoiler, content } = extractSpoilerContent(msg.content);
  const command = isSpoiler ? peekCommandName(content, prefix) : null;

  if (!isSpoiler || !SPOILERABLE_COMMANDS.has(command)) {
    return { content: msg.content, isSpoiler: false, message: msg };
  }

  return {
    content,
    isSpoiler: true,
    message: spoilerWrappedMessage(msg),
  };
}

module.exports = {
  extractSpoilerContent,
  wrapTextInSpoiler,
  wrapEmbedInSpoiler,
  wrapPayloadInSpoiler,
  spoilerWrappedChannel,
  spoilerWrappedMessage,
  applySpoilerMiddleware,
  isSickCardLink,
  spoilerCardAttachmentPayload,
  SPOILERABLE_COMMANDS,
};
