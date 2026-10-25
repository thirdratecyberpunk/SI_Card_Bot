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

| Option   | Type   | Required | Description                                                                                                                                                                                                                                                                                                                |
| -------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spirit` | string | yes      | Spirit whose incarna to show. One of: `Lure of the Deep Wilderness (Lair)`, `Serpent Slumbering Beneath the Island (Locus)`, `Thunderspeaker (Warrior)`, `Breath of Darkness Down Your Spine`, `Ember-Eyed Behemoth`, `Towering Roots of the Jungle`, `Wandering Voice Keens Delirium`, `Covets Gleaming Shards of Earth`. |
| `side`   | string | no       | Unempowered (front) or empowered (back); defaults to front. One of: `front`, `back`.                                                                                                                                                                                                                                       |

Returns a spirit's Incarna card panel image - the unempowered (front) side by default, or the empowered side via the `side` option.
