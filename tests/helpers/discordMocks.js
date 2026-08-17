/**
 * Lightweight stand-ins for the pieces of discord.js that command modules
 * touch (msg.channel.send, msg.reply, msg.guild.emojis, reaction handles).
 * Deliberately not a full discord.js Message: command modules under
 * commands/ never construct or type-check against the real class, they
 * just call methods on whatever `msg` they're handed.
 */
function createSentMessageStub() {
  return {
    react: jest.fn().mockResolvedValue(undefined),
  };
}

function createMockMessage({ channelId = "test-channel-id" } = {}) {
  const channel = {
    id: channelId,
    send: jest.fn(async (content) => {
      msg.__sent.push(content);
      return createSentMessageStub();
    }),
  };

  const msg = {
    channel,
    reply: jest.fn(async (content) => {
      msg.__sent.push(content);
      return createSentMessageStub();
    }),
    author: { id: "test-user-id", username: "tester", bot: false },
    guild: {
      emojis: {
        cache: {
          find: jest.fn(() => ({ id: "fake-emoji-id", name: "Fast" })),
        },
      },
    },
    content: "",
    __sent: [],
  };

  return msg;
}

/**
 * Stubs @sapphire/discord.js-utilities' PaginatedMessage so commands that
 * build a paginated embed list (spirit.js, aspects.js with no args) can run
 * without a real discord.js Message/InteractionCollector. Call this from a
 * test file *before* requiring the command module under test, e.g.:
 *
 *   jest.mock("@sapphire/discord.js-utilities", () =>
 *     require("./helpers/discordMocks").paginatedMessageMock(),
 *   );
 */
function paginatedMessageMock() {
  return {
    PaginatedMessage: jest.fn().mockImplementation(() => {
      const pages = [];
      const instance = {
        pages,
        addPageEmbed(builder) {
          const fakeEmbed = {
            setTitle: jest.fn().mockReturnThis(),
            setDescription: jest.fn().mockReturnThis(),
          };
          if (typeof builder === "function") builder(fakeEmbed);
          pages.push(fakeEmbed);
          return instance;
        },
        run: jest.fn(async (msg) => {
          return msg.channel.send(`__paginated__ pages=${pages.length}`);
        }),
      };
      return instance;
    }),
  };
}

module.exports = { createMockMessage, paginatedMessageMock };
