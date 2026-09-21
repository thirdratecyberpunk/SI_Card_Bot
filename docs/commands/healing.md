---
title: "/healing"
layout: default
---

[← Back to command list](../index.html)

# /healing

Get a healing card

## Usage

```
/healing <card> [side]
```

## Options

| Option | Type   | Required | Description                                                               |
| ------ | ------ | -------- | ------------------------------------------------------------------------- |
| `card` | string | yes      | Which healing card to show. One of: `roiling`, `serene`, `renew`, `ruin`. |
| `side` | string | no       | Which side of the card (defaults to front). One of: `front`, `back`.      |

Looks up a Wounded Waters Bleeding healing card (roiling, serene, renew or ruin) and returns its panel image - front by default, or the back via the `side` option.
