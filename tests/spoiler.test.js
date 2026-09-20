const {
  wrapTextInSpoiler,
  wrapEmbedInSpoiler,
  wrapPayloadInSpoiler,
  spoilerWrappedChannel,
  spoilerWrappedMessage,
  applySpoilerMiddleware,
  isSickCardLink,
  spoilerCardAttachmentPayload,
  SPOILERABLE_COMMANDS,
} = require("../utils/spoiler.cjs");
const { createMockInteraction } = require("./helpers/discordMocks");

describe("wrapTextInSpoiler", () => {
  it("wraps plain text in spoiler markdown", () => {
    expect(wrapTextInSpoiler("hello")).toBe("||hello||");
  });

  it("doesn't double-wrap text that's already spoilered", () => {
    expect(wrapTextInSpoiler("||hello||")).toBe("||hello||");
  });

  it("leaves an empty string untouched", () => {
    expect(wrapTextInSpoiler("")).toBe("");
  });
});

describe("wrapEmbedInSpoiler", () => {
  it("wraps a plain-object embed's description", () => {
    const embed = { description: "spirit info" };
    expect(wrapEmbedInSpoiler(embed)).toEqual({
      description: "||spirit info||",
    });
  });

  it("wraps a builder-style embed's description via setDescription", () => {
    const embed = {
      data: { description: "spirit info" },
      setDescription: jest.fn(function (value) {
        this.data.description = value;
        return this;
      }),
    };
    wrapEmbedInSpoiler(embed);
    expect(embed.setDescription).toHaveBeenCalledWith("||spirit info||");
    expect(embed.data.description).toBe("||spirit info||");
  });

  it("leaves non-embed values untouched", () => {
    expect(wrapEmbedInSpoiler("just a string")).toBe("just a string");
    expect(wrapEmbedInSpoiler(null)).toBeNull();
  });
});

describe("isSickCardLink", () => {
  it("recognises a SICK card image link", () => {
    expect(
      isSickCardLink(
        "https://sick.oberien.de/imgs/events/promising_venture.webp",
      ),
    ).toBe(true);
  });

  it("rejects links from other hosts", () => {
    expect(isSickCardLink("https://imgur.com/nlpGjjH")).toBe(false);
  });

  it("rejects plain text", () => {
    expect(isSickCardLink("Base (difficulty 3)")).toBe(false);
  });
});

describe("spoilerCardAttachmentPayload", () => {
  it("builds a bare SPOILER_-prefixed attachment payload for the card image, with no embed", () => {
    const url = "https://sick.oberien.de/imgs/events/promising_venture.webp";
    const payload = spoilerCardAttachmentPayload(url);

    expect(payload).toEqual({
      files: [{ attachment: url, name: "SPOILER_promising_venture.webp" }],
    });
  });
});

describe("wrapPayloadInSpoiler", () => {
  it("turns a SICK card link into a bare SPOILER_-prefixed attachment instead of a spoilered link", () => {
    const url = "https://sick.oberien.de/imgs/events/promising_venture.webp";
    const result = wrapPayloadInSpoiler(url);

    expect(result).toEqual({
      files: [{ attachment: url, name: "SPOILER_promising_venture.webp" }],
    });
  });

  it("wraps a non-SICK plain string payload in spoiler markdown as before", () => {
    expect(wrapPayloadInSpoiler("https://imgur.com/nlpGjjH")).toBe(
      "||https://imgur.com/nlpGjjH||",
    );
  });

  it("wraps the content field of a MessageCreateOptions-style payload", () => {
    const result = wrapPayloadInSpoiler({ content: "hello" });
    expect(result).toEqual({ content: "||hello||" });
  });

  it("wraps embed descriptions inside an embeds array", () => {
    const result = wrapPayloadInSpoiler({
      embeds: [{ description: "spirit info" }],
    });
    expect(result.embeds[0].description).toBe("||spirit info||");
  });

  it("wraps a bare embed builder passed directly to send()", () => {
    const embed = { description: "spirit info" };
    expect(wrapPayloadInSpoiler(embed)).toEqual({
      description: "||spirit info||",
    });
  });

  it("passes through payloads it doesn't recognise", () => {
    const files = { files: ["a.png"] };
    expect(wrapPayloadInSpoiler(files)).toBe(files);
  });
});

describe("spoilerWrappedChannel", () => {
  it("spoiler-wraps a plain string sent through it", async () => {
    const channel = { id: "c1", send: jest.fn().mockResolvedValue("sent") };
    const wrapped = spoilerWrappedChannel(channel);

    await wrapped.send("https://imgur.com/nlpGjjH");

    expect(channel.send).toHaveBeenCalledWith("||https://imgur.com/nlpGjjH||");
  });

  it("turns a SICK card link sent through it into a blurred attachment", async () => {
    const channel = { id: "c1", send: jest.fn().mockResolvedValue("sent") };
    const wrapped = spoilerWrappedChannel(channel);
    const url = "https://sick.oberien.de/imgs/events/promising_venture.webp";

    await wrapped.send(url);

    expect(channel.send).toHaveBeenCalledWith({
      files: [{ attachment: url, name: "SPOILER_promising_venture.webp" }],
    });
  });

  it("delegates other properties straight through to the real channel", () => {
    const channel = { id: "c1", send: jest.fn() };
    const wrapped = spoilerWrappedChannel(channel);

    expect(wrapped.id).toBe("c1");
  });
});

describe("SPOILERABLE_COMMANDS", () => {
  it("only allows search, event and fear to be spoilered", () => {
    expect(SPOILERABLE_COMMANDS).toEqual(new Set(["search", "event", "fear"]));
  });
});

describe("applySpoilerMiddleware", () => {
  function createMessage() {
    const channel = { id: "c1", send: jest.fn().mockResolvedValue("sent") };
    return { channel, author: { id: "u1" } };
  }

  const CARD_URL = "https://sick.oberien.de/imgs/events/promising_venture.webp";
  const SPOILERED_CARD = {
    files: [{ attachment: CARD_URL, name: "SPOILER_promising_venture.webp" }],
  };

  it("leaves the message alone when the spoiler option isn't set", () => {
    const msg = createMessage();
    const interaction = createMockInteraction({
      commandName: "event",
      options: { card: "promising venture" },
    });

    const { isSpoiler, message } = applySpoilerMiddleware(interaction, msg);

    expect(isSpoiler).toBe(false);
    expect(message).toBe(msg);
  });

  it.each(["search", "event", "fear"])(
    "spoiler-tags whatever /%s sends back when the option is set",
    async (commandName) => {
      const msg = createMessage();
      const interaction = createMockInteraction({
        commandName,
        options: { spoiler: true },
      });

      const { isSpoiler, message } = applySpoilerMiddleware(interaction, msg);
      expect(isSpoiler).toBe(true);

      await message.channel.send(CARD_URL);

      expect(msg.channel.send).toHaveBeenCalledWith(SPOILERED_CARD);
    },
  );

  it("ignores the toggle on a command outside the allow-list", () => {
    const msg = createMessage();
    const interaction = createMockInteraction({
      commandName: "random",
      options: { spoiler: true },
    });

    const { isSpoiler, message } = applySpoilerMiddleware(interaction, msg);

    expect(isSpoiler).toBe(false);
    expect(message).toBe(msg);
  });

  it("copes with a command that declares no options at all", () => {
    const msg = createMessage();
    const interaction = createMockInteraction({ commandName: "help" });

    expect(applySpoilerMiddleware(interaction, msg).message).toBe(msg);
  });

  it("still exposes the message's other properties through the wrapper", () => {
    const msg = createMessage();
    const interaction = createMockInteraction({
      commandName: "event",
      options: { spoiler: true },
    });

    const { message } = applySpoilerMiddleware(interaction, msg);

    expect(message.author).toBe(msg.author);
  });
});
