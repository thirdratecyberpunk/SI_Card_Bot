---
title: "/scenario"
layout: default
---

[← Back to command list](../index.html)

# /scenario

Gets the front or back panel for a given scenario

## Usage

```
/scenario <scenario> [side]
```

## Options

| Option     | Type   | Required | Description                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scenario` | string | yes      | Which scenario to show. One of: `Blitz`, `Guard the Isle's Heart`, `Rituals of Terror`, `Dahan Insurrection`, `Second Wave`, `Powers Long Forgotten`, `Ward the Shores`, `Rituals of the Destroying Flame`, `Elemental Invocation`, `Despicable Theft`, `The Great River`, `A Diversity of Spirits`, `Varied Terrains`, `Destiny Unfolds`, `Surges of Colonization`, `Larger Surges`. |
| `side`     | string | no       | Which side of the panel (defaults to back). One of: `front`, `back`.                                                                                                                                                                                                                                                                                                                  |

Returns a scenario's panel image - the back (its rules side) by default, or the front via the `side` option.
