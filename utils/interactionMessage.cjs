/**
 * Presents a slash command interaction to a command module as the
 * message-shaped object it was written against.
 *
 * Command modules reply by calling `msg.channel.send(...)` (some of them
 * several times - /random sends a name then an emote, /aspect sends one
 * message per panel), which has no direct equivalent in the interaction
 * API: an interaction gets exactly one reply, and everything after that
 * has to be a follow-up. This wraps those rules up so the modules don't
 * have to know about them - the first send fills in the deferred reply,
 * every later send becomes a follow-up.
 */
const { isEmbedLike } = require("./spoiler.cjs");

/**
 * discord.js accepts a bare string or a MessageCreateOptions-style object,
 * but not a raw embed builder - and several commands hand `send()` an
 * embed directly. Those get boxed into `{ embeds: [...] }` rather than
 * throwing.
 */
function normaliseSendPayload(payload) {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return String(payload);
  if (
    "content" in payload ||
    "embeds" in payload ||
    "files" in payload ||
    "components" in payload
  ) {
    return payload;
  }
  if (isEmbedLike(payload)) return { embeds: [payload] };
  return payload;
}

/**
 * Sends one payload on the interaction, picking reply/editReply/followUp
 * based on what's already been sent. index.ts defers before dispatching,
 * so in practice the first call edits the deferred reply into place and
 * the rest are follow-ups; the un-deferred branch is there so the adapter
 * is usable on its own.
 */
async function respond(interaction, payload) {
  const options = normaliseSendPayload(payload);

  if (!interaction.deferred && !interaction.replied) {
    await interaction.reply(options);
    return interaction.fetchReply();
  }
  if (!interaction.replied) {
    return interaction.editReply(options);
  }
  return interaction.followUp(options);
}

/**
 * Wraps `interaction` in the subset of discord.js' Message API that the
 * command modules actually touch. `interaction` is kept on the result so
 * things that need the real thing (see paginationTarget) can reach it.
 */
function createInteractionMessage(interaction) {
  // Sends are queued rather than issued straight away. Not every command
  // awaits its own sends - aspect.js fires one per panel in a bare for
  // loop - and two unawaited sends would both see an unanswered
  // interaction and both try to be the reply, with the second overwriting
  // the first. Chaining them keeps the reply/follow-up sequence (and the
  // order the messages arrive in) correct however the caller writes it.
  let pending = Promise.resolve();

  const send = (payload) => {
    const sent = pending.then(() => respond(interaction, payload));
    // The queue itself must not reject, or one failed send would swallow
    // every send after it; the caller still sees the real rejection.
    pending = sent.then(
      () => undefined,
      () => undefined,
    );
    return sent;
  };

  return {
    interaction,
    // Resolves once every queued send has gone out. Commands that don't
    // await their own sends would otherwise return while their messages
    // are still in flight, and the dispatcher can't tell "said nothing"
    // from "hasn't said it yet".
    flush: () => pending,
    content: "",
    channel: {
      id: interaction.channelId,
      send,
    },
    // Commands use reply() and channel.send() interchangeably; on an
    // interaction both mean "respond to the person who ran the command".
    reply: send,
    author: interaction.user,
    member: interaction.member,
    guild: interaction.guild,
    client: interaction.client,
  };
}

/**
 * What to hand `PaginatedMessage.run()`. It drives its own buttons through
 * a component collector and knows how to do that on an interaction, so it
 * gets the real interaction rather than this adapter - passing the adapter
 * would leave the buttons dead.
 */
function paginationTarget(msg) {
  return msg?.interaction ?? msg;
}

module.exports = {
  createInteractionMessage,
  paginationTarget,
  normaliseSendPayload,
  respond,
};
