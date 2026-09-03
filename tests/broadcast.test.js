const { ChannelType } = require("discord.js");
const {
  formatChangelogMessage,
  findAnnouncementChannel,
  broadcastToGuilds,
} = require("../utils/broadcast.cjs");

function createChannel({
  id,
  type = ChannelType.GuildText,
  rawPosition = 0,
  canSend = true,
}) {
  return {
    id,
    type,
    rawPosition,
    permissionsFor: jest.fn(() => ({ has: () => canSend })),
    send: jest.fn().mockResolvedValue(undefined),
  };
}

function createGuild({ id, systemChannel = null, channels = [] }) {
  return {
    id,
    systemChannel,
    members: { me: { id: "bot-id" } },
    channels: { cache: new Map(channels.map((c) => [c.id, c])) },
  };
}

describe("formatChangelogMessage", () => {
  it("bullets each change under a header", () => {
    const message = formatChangelogMessage(["Fixed a bug", "Added a card"]);
    expect(message).toBe(
      "**SI Card Bot has been updated!**\n- Fixed a bug\n- Added a card",
    );
  });
});

describe("findAnnouncementChannel", () => {
  it("prefers the system channel when the bot can post there", () => {
    const systemChannel = createChannel({ id: "system" });
    const other = createChannel({ id: "other" });
    const guild = createGuild({ systemChannel, channels: [other] });

    expect(findAnnouncementChannel(guild)).toBe(systemChannel);
  });

  it("falls back to the topmost postable text channel when there's no usable system channel", () => {
    const lower = createChannel({ id: "lower", rawPosition: 2 });
    const higher = createChannel({ id: "higher", rawPosition: 1 });
    const guild = createGuild({ channels: [lower, higher] });

    expect(findAnnouncementChannel(guild)).toBe(higher);
  });

  it("skips channels the bot can't send in and non-text channel types", () => {
    const noPerms = createChannel({ id: "no-perms", canSend: false });
    const voice = createChannel({ id: "voice", type: ChannelType.GuildVoice });
    const usable = createChannel({ id: "usable", rawPosition: 5 });
    const guild = createGuild({ channels: [noPerms, voice, usable] });

    expect(findAnnouncementChannel(guild)).toBe(usable);
  });

  it("returns null when nothing is postable", () => {
    const guild = createGuild({ channels: [] });
    expect(findAnnouncementChannel(guild)).toBeNull();
  });

  it("returns null when the bot isn't a member of the guild", () => {
    const guild = createGuild({ channels: [createChannel({ id: "a" })] });
    guild.members.me = null;
    expect(findAnnouncementChannel(guild)).toBeNull();
  });
});

describe("broadcastToGuilds", () => {
  it("sends the message to every guild with a postable channel and skips the rest", async () => {
    const channelA = createChannel({ id: "a" });
    const guildA = createGuild({ id: "guild-a", channels: [channelA] });
    const guildB = createGuild({ id: "guild-b", channels: [] });

    const client = {
      guilds: {
        cache: new Map([
          ["guild-a", guildA],
          ["guild-b", guildB],
        ]),
      },
    };

    const result = await broadcastToGuilds(client, "hello");

    expect(channelA.send).toHaveBeenCalledWith("hello");
    expect(result).toEqual({ sent: 1, skipped: 1 });
  });

  it("counts a send failure in one guild as skipped without affecting others", async () => {
    const failing = createChannel({ id: "failing" });
    failing.send.mockRejectedValue(new Error("boom"));
    const guildFailing = createGuild({
      id: "guild-failing",
      channels: [failing],
    });

    const succeeding = createChannel({ id: "ok" });
    const guildOk = createGuild({ id: "guild-ok", channels: [succeeding] });

    const client = {
      guilds: {
        cache: new Map([
          ["guild-failing", guildFailing],
          ["guild-ok", guildOk],
        ]),
      },
    };

    const result = await broadcastToGuilds(client, "hello");

    expect(result).toEqual({ sent: 1, skipped: 1 });
  });
});
