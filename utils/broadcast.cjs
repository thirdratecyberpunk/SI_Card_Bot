const { ChannelType } = require("discord.js");

/**
 * Formats a list of change descriptions into the message posted to every
 * guild when a deploy goes out.
 */
function formatChangelogMessage(changes) {
  const list = changes.map((change) => `- ${change}`).join("\n");
  return `**SI Card Bot has been updated!**\n${list}`;
}

/**
 * Picks the channel to post the changelog in for a given guild: the
 * system channel if the bot can post there, otherwise the topmost text
 * channel it has View+Send permissions in. Returns null if no channel
 * qualifies (e.g. bot has no send permission anywhere).
 */
function findAnnouncementChannel(guild) {
  const me = guild.members.me;
  if (!me) return null;

  const canAnnounce = (channel) => {
    if (
      channel.type !== ChannelType.GuildText &&
      channel.type !== ChannelType.GuildAnnouncement
    ) {
      return false;
    }
    const perms = channel.permissionsFor(me);
    return !!perms?.has(["ViewChannel", "SendMessages"]);
  };

  if (guild.systemChannel && canAnnounce(guild.systemChannel)) {
    return guild.systemChannel;
  }

  const candidates = [...guild.channels.cache.values()].filter(canAnnounce);
  candidates.sort((a, b) => a.rawPosition - b.rawPosition);
  return candidates[0] ?? null;
}

/**
 * Sends `message` to every guild the bot is currently in, one channel per
 * guild (see findAnnouncementChannel). Failures in one guild don't stop the
 * others - the deploy pipeline treats this as best-effort notification.
 */
async function broadcastToGuilds(client, message) {
  let sent = 0;
  let skipped = 0;

  for (const guild of client.guilds.cache.values()) {
    const channel = findAnnouncementChannel(guild);
    if (!channel) {
      skipped++;
      continue;
    }
    try {
      await channel.send(message);
      sent++;
    } catch (error) {
      console.error(`Failed to send changelog to guild ${guild.id}:`, error);
      skipped++;
    }
  }

  return { sent, skipped };
}

module.exports = {
  formatChangelogMessage,
  findAnnouncementChannel,
  broadcastToGuilds,
};
