---
title: "/incarna"
layout: default
---

[← Back to command list](../index.html)

# /incarna

Get an incarna

## Usage

```
/incarna <spirit> [side]
```

## Options

| Option   | Type   | Required | Description                                                                                                                                                                                                                                                     |
| -------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spirit` | string | yes      | Spirit whose incarna to show. One of: `Wandering Voice Keens Delirium`, `Towering Roots of the Jungle`, `Breath of Darkness Down Your Spine`, `Ember Eyed Behemoth`, `Serpent Slumbering (Locus)`, `Thunderspeaker (Warrior)`, `Lure of the Wilderness (Lair)`. |
| `side`   | string | no       | Unempowered (front) or empowered (back); defaults to front. One of: `front`, `back`.                                                                                                                                                                            |

Returns a spirit's Incarna card panel image - the unempowered (front) side by default, or the empowered side via the `side` option.
