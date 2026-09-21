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
// ignores the spoiler toggle entirely - card lookups and search results
// are the things worth hiding, not e.g. /help or /random. A command in
// this set declares `spoilerable: true`, which is what puts the `spoiler`
// option on its slash command (see utils/slashCommands.cjs).
const SPOILERABLE_COMMANDS = new Set(["search", "event", "fear"]);

/**
 * Discord bot middleware: if a slash command supports spoilering (see
 * SPOILERABLE_COMMANDS) and the user ticked its `spoiler` option, hands
 * back a version of `message` whose `channel.send` spoiler-tags whatever
 * the command sends back. For every other command, and for a spoilerable
 * one run without the toggle, it hands back `message` untouched - so
 * /random, /help and friends behave exactly as if this middleware didn't
 * exist.
 *
 * This is the slash equivalent of the old prefix-era trick of typing
 * `||-event promising||`: the wrapping of the command's *output* is
 * unchanged, only the way the user asks for it has moved from spoiler
 * bars around the message to a checkbox on the command.
 */
function applySpoilerMiddleware(interaction, message) {
  const command = interaction?.commandName;
  const requested =
    SPOILERABLE_COMMANDS.has(command) &&
    interaction.options?.getBoolean?.("spoiler") === true;

  if (!requested) {
    return { isSpoiler: false, message };
  }

  return { isSpoiler: true, message: spoilerWrappedMessage(message) };
}

module.exports = {
  wrapTextInSpoiler,
  wrapEmbedInSpoiler,
  wrapPayloadInSpoiler,
  spoilerWrappedChannel,
  spoilerWrappedMessage,
  applySpoilerMiddleware,
  isSickCardLink,
  spoilerCardAttachmentPayload,
  isEmbedLike,
  SPOILERABLE_COMMANDS,
};
