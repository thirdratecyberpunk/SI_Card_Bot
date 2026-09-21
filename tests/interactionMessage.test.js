/**
 * Tests for the adapter that lets the command modules keep replying with
 * `msg.channel.send(...)` now that they're driven by interactions.
 *
 * The interesting behaviour is the reply/follow-up sequencing: an
 * interaction has exactly one reply and everything after it has to be a
 * follow-up, but several commands (/random, /aspect with a multi-panel
 * aspect) call send() more than once.
 */
jest.mock("@sapphire/discord.js-utilities", () =>
  require("./helpers/discordMocks").paginatedMessageMock(),
);

const {
  createInteractionMessage,
  paginationTarget,
  normaliseSendPayload,
} = require("../utils/interactionMessage.cjs");
const { argsFromInteraction } = require("../utils/slashCommands.cjs");
const { applySpoilerMiddleware } = require("../utils/spoiler.cjs");
const { createMockInteraction } = require("./helpers/discordMocks");
const { loadCommands } = require("../commandLoader.cjs");

describe("createInteractionMessage", () => {
  it("fills in a deferred reply on the first send", async () => {
    const interaction = createMockInteraction();
    await interaction.deferReply();
    const msg = createInteractionMessage(interaction);

    await msg.channel.send("first");

    expect(interaction.editReply).toHaveBeenCalledWith("first");
    expect(interaction.followUp).not.toHaveBeenCalled();
  });

  it("sends everything after the first as a follow-up", async () => {
    const interaction = createMockInteraction();
    await interaction.deferReply();
    const msg = createInteractionMessage(interaction);

    await msg.channel.send("first");
    await msg.channel.send("second");
    await msg.channel.send("third");

    expect(interaction.editReply).toHaveBeenCalledTimes(1);
    expect(interaction.followUp.mock.calls.map(([payload]) => payload)).toEqual(
      ["second", "third"],
    );
  });

  it("replies outright when nothing has deferred the interaction", async () => {
    const interaction = createMockInteraction();
    const msg = createInteractionMessage(interaction);

    await msg.channel.send("hello");

    expect(interaction.reply).toHaveBeenCalledWith("hello");
  });

  it("treats reply() and channel.send() as the same thing", async () => {
    const interaction = createMockInteraction();
    await interaction.deferReply();
    const msg = createInteractionMessage(interaction);

    await msg.reply({ files: [{ attachment: Buffer.from("x") }] });

    expect(interaction.editReply).toHaveBeenCalledWith({
      files: [{ attachment: expect.any(Buffer) }],
    });
  });

  it("exposes the caller and channel the commands read", () => {
    const interaction = createMockInteraction({ channelId: "c99" });
    const msg = createInteractionMessage(interaction);

    expect(msg.channel.id).toBe("c99");
    expect(msg.author).toBe(interaction.user);
    expect(msg.guild).toBe(interaction.guild);
  });
});

describe("normaliseSendPayload", () => {
  it("leaves strings and message options alone", () => {
    expect(normaliseSendPayload("hi")).toBe("hi");
    const options = { content: "hi", embeds: [] };
    expect(normaliseSendPayload(options)).toBe(options);
  });

  it("boxes a bare embed, which send() accepts but reply() doesn't", () => {
    const embed = { description: "spirit info" };
    expect(normaliseSendPayload(embed)).toEqual({ embeds: [embed] });
  });
});

describe("paginationTarget", () => {
  it("hands PaginatedMessage the real interaction so its buttons work", () => {
    const interaction = createMockInteraction();
    const msg = createInteractionMessage(interaction);
    expect(paginationTarget(msg)).toBe(interaction);
  });

  it("passes a plain message straight through", () => {
    const msg = { channel: { send: jest.fn() } };
    expect(paginationTarget(msg)).toBe(msg);
  });
});

/**
 * The pieces above wired together the way index.ts wires them, so the
 * option -> args -> adapter -> Discord path is covered end to end rather
 * than only a unit at a time.
 */
describe("dispatching an interaction to a command", () => {
  const { commands } = loadCommands();

  async function dispatch({ commandName, options = {}, subcommand = null }) {
    const interaction = createMockInteraction({
      commandName,
      options,
      subcommand,
    });
    const command = commands.get(commandName);

    await interaction.deferReply();
    const args = argsFromInteraction(interaction, command);
    const { message } = applySpoilerMiddleware(
      interaction,
      createInteractionMessage(interaction),
    );
    await command.execute(message, args, require("discord.js"));

    return interaction;
  }

  it("looks a card up from a multi-word option", async () => {
    const interaction = await dispatch({
      commandName: "power",
      options: { card: "Fields Choked with Growth" },
    });

    expect(interaction.__sent).toEqual([
      "https://sick.oberien.de/imgs/powers/fields_choked_with_growth.webp",
    ]);
  });

  it("turns a spoilered card lookup into a blurred attachment", async () => {
    const interaction = await dispatch({
      commandName: "event",
      options: { card: "slave rebellion", spoiler: true },
    });

    expect(interaction.__sent).toEqual([
      {
        files: [
          {
            attachment:
              "https://sick.oberien.de/imgs/events/slave_rebellion.webp",
            name: "SPOILER_slave_rebellion.webp",
          },
        ],
      },
    ]);
  });

  it("sends the plain link when the spoiler toggle is left off", async () => {
    const interaction = await dispatch({
      commandName: "event",
      options: { card: "slave rebellion" },
    });

    expect(interaction.__sent).toEqual([
      "https://sick.oberien.de/imgs/events/slave_rebellion.webp",
    ]);
  });

  it("follows up for a command that sends more than one message", async () => {
    const interaction = await dispatch({
      commandName: "random",
      subcommand: "board",
      options: { type: "thematic" },
    });

    // /random sends the board name, then its image link.
    expect(interaction.editReply).toHaveBeenCalledTimes(1);
    expect(interaction.followUp).toHaveBeenCalledTimes(1);
    expect(interaction.__sent).toHaveLength(2);
  });

  it("reads a side option regardless of where it lands in args", async () => {
    const interaction = await dispatch({
      commandName: "scenario",
      options: { scenario: "Blitz", side: "front" },
    });

    expect(interaction.__sent).toEqual(["https://i.imgur.com/l9LsFb7.png"]);
  });

  it("renders the adversary card from named option values", async () => {
    const interaction = await dispatch({
      commandName: "invaderdeck",
      options: { leading: "prussia", leading_level: 4 },
    });

    expect(interaction.__sent[0]).toEqual(
      expect.stringContaining("invader deck is:"),
    );
  });
});

describe("sends that the command doesn't await", () => {
  it("still go out in order, as one reply followed by follow-ups", async () => {
    const interaction = createMockInteraction();
    await interaction.deferReply();
    const msg = createInteractionMessage(interaction);

    // aspect.js sends one message per panel without awaiting any of them.
    msg.channel.send("panel 1");
    msg.channel.send("panel 2");
    await msg.channel.send("panel 3");

    expect(interaction.editReply).toHaveBeenCalledTimes(1);
    expect(interaction.__sent).toEqual(["panel 1", "panel 2", "panel 3"]);
  });

  it("keeps sending after one of them fails", async () => {
    const interaction = createMockInteraction();
    await interaction.deferReply();
    const msg = createInteractionMessage(interaction);
    interaction.editReply.mockRejectedValueOnce(new Error("boom"));

    await expect(msg.channel.send("first")).rejects.toThrow("boom");
    await msg.channel.send("second");

    expect(interaction.__sent).toEqual(["second"]);
  });
});

describe("flush", () => {
  it("waits for sends the command never awaited, so the dispatcher can tell it replied", async () => {
    const interaction = createMockInteraction();
    await interaction.deferReply();
    const msg = createInteractionMessage(interaction);

    msg.channel.send("panel 1");
    expect(interaction.replied).toBe(false);

    await msg.flush();

    expect(interaction.replied).toBe(true);
  });

  it("survives the spoiler middleware's proxy", async () => {
    const interaction = createMockInteraction({
      commandName: "event",
      options: { spoiler: true },
    });
    await interaction.deferReply();
    const { message } = applySpoilerMiddleware(
      interaction,
      createInteractionMessage(interaction),
    );

    message.channel.send("https://imgur.com/nlpGjjH");
    await message.flush();

    expect(interaction.__sent).toEqual(["||https://imgur.com/nlpGjjH||"]);
  });
});
