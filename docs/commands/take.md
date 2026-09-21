---
title: "/take"
layout: default
---

[← Back to command list](../index.html)

# /take

Take a random card and send the SICK link. For more than 1 card, use /draw instead.

## Usage

```
/take <type>
```

## Options

| Option | Type   | Required | Description                                                                |
| ------ | ------ | -------- | -------------------------------------------------------------------------- |
| `type` | string | yes      | Type of card to take. One of: `minor`, `major`, `fear`, `event`, `blight`. |

Draws a single random card of the given type (minor, major, fear, event or blight) and returns its SICK card-catalog image link directly. For more than one card, use /draw instead.
