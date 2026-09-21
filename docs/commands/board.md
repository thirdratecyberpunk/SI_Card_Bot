---
title: "/board"
layout: default
---

[← Back to command list](../index.html)

# /board

Displays Boards

## Usage

```
/board [board]
```

## Options

| Option  | Type   | Required | Description                                                                                                                                 |
| ------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `board` | string | no       | Which board to show (blank lists the valid inputs). One of: `a`, `b`, `c`, `d`, `e`, `f`, `g`, `h`, `ne`, `nw`, `east`, `west`, `se`, `sw`. |

Returns the map image for a board - core boards a-h, or a directional/thematic board (NE, NW, East, West, SE, SW). Run it without picking a board to see the full list.
