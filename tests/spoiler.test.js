const {
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
} = require("../utils/spoiler.cjs");

const PREFIX = "-";

describe("extractSpoilerContent", () => {
  it("unwraps a message that's fully wrapped in spoiler markdown", () => {
    expect(extractSpoilerContent("||-event promising||")).toEqual({
      isSpoiler: true,
      content: "-event promising",
    });
  });

  it("unwraps a message with surrounding whitespace", () => {
    expect(extractSpoilerContent("  ||-random spirit||  ")).toEqual({
      isSpoiler: true,
      content: "-random spirit",
    });
  });

  it("leaves ordinary command messages untouched", () => {
    expect(extractSpoilerContent("-event promising")).toEqual({
      isSpoiler: false,
      content: "-event promising",
    });
  });

  it("doesn't treat a partial spoiler as a fully spoilered message", () => {
    expect(extractSpoilerContent("-event ||promising||")).toEqual({
      isSpoiler: false,
      content: "-event ||promising||",
    });
  });

  it("doesn't treat a bare || as a spoiler", () => {
    expect(extractSpoilerContent("||")).toEqual({
      isSpoiler: false,
      content: "||",
    });
  });
});

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

describe("spoilerWrappedMessage / applySpoilerMiddleware", () => {
  function createMessage(content) {
    const channel = { id: "c1", send: jest.fn().mockResolvedValue("sent") };
    return { content, channel, author: { id: "u1" } };
  }

  it("returns the original message unchanged when there's no spoiler wrapper", () => {
    const msg = createMessage("-event promising");
    const { content, isSpoiler, message } = applySpoilerMiddleware(
      msg,
      PREFIX,
    );

    expect(isSpoiler).toBe(false);
    expect(content).toBe("-event promising");
    expect(message).toBe(msg);
  });

  it.each(["search", "event", "fear"])(
    "unwraps -%s and spoiler-tags whatever it sends back",
    async (commandName) => {
      const msg = createMessage(`||-${commandName} promising||`);
      const { content, isSpoiler, message } = applySpoilerMiddleware(
        msg,
        PREFIX,
      );

      expect(isSpoiler).toBe(true);
      expect(content).toBe(`-${commandName} promising`);

      const url =
        "https://sick.oberien.de/imgs/events/promising_venture.webp";
      await message.channel.send(url);

      expect(msg.channel.send).toHaveBeenCalledWith({
        files: [{ attachment: url, name: "SPOILER_promising_venture.webp" }],
      });
    },
  );

  it("leaves a spoilered command outside the allow-list completely untouched", () => {
    const msg = createMessage("||-random spirit||");
    const { content, isSpoiler, message } = applySpoilerMiddleware(
      msg,
      PREFIX,
    );

    expect(isSpoiler).toBe(false);
    expect(content).toBe("||-random spirit||");
    expect(message).toBe(msg);
  });

  it("leaves a spoilered -help untouched too", () => {
    const msg = createMessage("||-help||");
    const { isSpoiler, message } = applySpoilerMiddleware(msg, PREFIX);

    expect(isSpoiler).toBe(false);
    expect(message).toBe(msg);
  });

  it("still exposes the message's other properties through the wrapper", () => {
    const msg = createMessage("||-event promising||");
    const { message } = applySpoilerMiddleware(msg, PREFIX);

    expect(message.author).toBe(msg.author);
  });
});
