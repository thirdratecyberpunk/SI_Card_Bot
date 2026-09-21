---
title: "/random"
layout: default
---

[← Back to command list](../index.html)

# /random

Get a random spirit, single/double adversary, board or scenario

## Usage

```
/random spirit [max_complexity]
/random adversary [min_difficulty] [max_difficulty]
/random double [min_difficulty] [max_difficulty]
/random scenario
/random board [type]
```

## Options

| Option                     | Type    | Required | Description                                                                          |
| -------------------------- | ------- | -------- | ------------------------------------------------------------------------------------ |
| `spirit max_complexity`    | string  | no       | Cap the spirit's complexity. One of: `low`, `moderate`, `high`, `very_high`.         |
| `adversary min_difficulty` | integer | no       | Lowest acceptable difficulty (0-11).                                                 |
| `adversary max_difficulty` | integer | no       | Highest acceptable difficulty (0-11).                                                |
| `double min_difficulty`    | integer | no       | Lowest acceptable combined difficulty (1-17).                                        |
| `double max_difficulty`    | integer | no       | Highest acceptable combined difficulty (1-17).                                       |
| `board type`               | string  | no       | Which pool to pick from (defaults to regular). One of: `regular`, `thematic`, `all`. |

Picks a uniformly random result for the given category: a spirit (optionally capped by max complexity), a single adversary or double-adversary setup (optionally bounded by a difficulty range), a scenario, or a board (regular/thematic/all) - then sends its name plus artwork/panel link.
