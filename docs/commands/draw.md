---
title: "/draw"
layout: default
---

[← Back to command list](../index.html)

# /draw

Draw up to 10 random cards. For only taking a single card, use /take instead.

## Usage

```
/draw <type> [amount]
```

## Options

| Option   | Type    | Required | Description                                                                |
| -------- | ------- | -------- | -------------------------------------------------------------------------- |
| `type`   | string  | yes      | Type of card to draw. One of: `minor`, `major`, `fear`, `event`, `blight`. |
| `amount` | integer | no       | How many to draw (1-10, defaults to 4).                                    |

Draws a random sample of cards of the given type (minor, major, fear, event or blight) and lists their names. Defaults to 4 cards if no amount is given; amount must be an integer from 1 to 10. For a single card with a direct image link, use /take instead.
