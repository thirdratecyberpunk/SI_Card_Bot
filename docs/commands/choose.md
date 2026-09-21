---
title: "/choose"
layout: default
---

[← Back to command list](../index.html)

# /choose

Choose from previously found results

## Usage

```
/choose <number>
```

## Options

| Option   | Type    | Required | Description                                               |
| -------- | ------- | -------- | --------------------------------------------------------- |
| `number` | integer | yes      | Which numbered option from the bot's last prompt to pick. |

Picks one of the numbered options from the bot's most recent multi-match prompt (e.g. when an /event search matches more than one card) and sends the chosen value. Only works immediately after such a prompt; the option list isn't saved between messages.
