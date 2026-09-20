---
title: "/adversaryrules"
layout: default
---

[← Back to command list](../index.html)

# /adversaryrules

Get adversary information specific to a given setup.

## Usage

```
/adversaryrules <leading> <leading_level> [supporting] [supporting_level] [nosetup]
```

## Options

| Option             | Type    | Required | Description                                                                                                                                                 |
| ------------------ | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `leading`          | string  | yes      | Leading adversary. One of: `prussia`, `england`, `france`, `habsburg_livestock`, `russia`, `scotland`, `sweden`, `habsburg_mining`.                         |
| `leading_level`    | integer | yes      | Leading adversary level (0-6).                                                                                                                              |
| `supporting`       | string  | no       | Supporting adversary, for a doubles setup. One of: `prussia`, `england`, `france`, `habsburg_livestock`, `russia`, `scotland`, `sweden`, `habsburg_mining`. |
| `supporting_level` | integer | no       | Supporting adversary level (0-6).                                                                                                                           |
| `nosetup`          | boolean | no       | Hide Setup-phase rules from the generated card.                                                                                                             |

Computes and renders a full summary card (as a PNG image) for one or two adversaries at given levels - combined difficulty, invader deck, fear deck, escalations, loss conditions, adversary-specific rules, and any doubles-specific notes. Set the `nosetup` option to hide Setup-phase rules from the card.
