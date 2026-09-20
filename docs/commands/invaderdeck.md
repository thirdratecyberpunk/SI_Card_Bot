---
title: "/invaderdeck"
layout: default
---

[← Back to command list](../index.html)

# /invaderdeck

Calculates the invader deck for a given adversary/double adversary set up.

## Usage

```
/invaderdeck <leading> <leading_level> [supporting] [supporting_level]
```

## Options

| Option             | Type    | Required | Description                                                                                                                                                 |
| ------------------ | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `leading`          | string  | yes      | Leading adversary. One of: `prussia`, `england`, `france`, `habsburg_livestock`, `russia`, `scotland`, `sweden`, `habsburg_mining`.                         |
| `leading_level`    | integer | yes      | Leading adversary level (0-6).                                                                                                                              |
| `supporting`       | string  | no       | Supporting adversary, for a doubles setup. One of: `prussia`, `england`, `france`, `habsburg_livestock`, `russia`, `scotland`, `sweden`, `habsburg_mining`. |
| `supporting_level` | integer | no       | Supporting adversary level (0-6).                                                                                                                           |

Calculates and lists the invader deck contents for a single adversary, or for a leading+supporting double-adversary setup, at the given difficulty levels.
