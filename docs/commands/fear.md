---
title: "/fear"
layout: default
---

[← Back to command list](../index.html)

# /fear

Fear card search

## Usage

```
/fear [card] [level] [spoiler]
```

## Options

| Option    | Type    | Required | Description                                                                     |
| --------- | ------- | -------- | ------------------------------------------------------------------------------- |
| `card`    | string  | no       | Fear card name (blank lists every fear card).                                   |
| `level`   | integer | no       | Send this terror level's text instead of the card image. One of: `1`, `2`, `3`. |
| `spoiler` | boolean | no       | Send the result as a click-to-reveal spoiler.                                   |

Looks up a Fear card by name and returns its SICK card image link. With no card given, sends a paginated alphabetical list of every Fear card's title. Set the `level` option (1, 2 or 3) to get that level's text instead, as a message rather than the card image - SICK's own page never exposes this text, it only ever renders the image. Set the `spoiler` option to have the bot send the result as a blurred, click-to-reveal spoiler.
