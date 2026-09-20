---
title: "/aspect"
layout: default
---

[← Back to command list](../index.html)

# /aspect

Shows cards for a given aspect (by name or emoji).

## Usage

```
/aspect <aspect> [card]
```

## Options

| Option   | Type    | Required | Description                                           |
| -------- | ------- | -------- | ----------------------------------------------------- |
| `aspect` | string  | yes      | Aspect name or emoji.                                 |
| `card`   | integer | no       | Which panel to send, if the aspect has more than one. |

Looks up a spirit Aspect by name or emoji and returns its card panel image(s). If the aspect has multiple panels (e.g. a two-part Locus card) and no card number is given, all of them are sent; give a number to send just one. Use /aspects to see which aspects a given spirit has.
