---
title: "/spirit"
layout: default
---

[← Back to command list](../index.html)

# /spirit

Spirit Search

## Usage

```
/spirit [spirit] [side]
```

## Options

| Option   | Type   | Required | Description                                                           |
| -------- | ------ | -------- | --------------------------------------------------------------------- |
| `spirit` | string | no       | Spirit name or alias (blank lists every spirit).                      |
| `side`   | string | no       | Which side of the panel (defaults to front). One of: `front`, `back`. |

Looks up a spirit by name or alias and returns its panel image (front by default, or the back via the `side` option). With no spirit given, sends a paginated alphabetical list of every spirit and its emote.
