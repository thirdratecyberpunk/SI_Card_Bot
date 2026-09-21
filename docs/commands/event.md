---
title: "/event"
layout: default
---

[← Back to command list](../index.html)

# /event

Event Search

## Usage

```
/event <card> [spoiler]
```

## Options

| Option    | Type    | Required | Description                                   |
| --------- | ------- | -------- | --------------------------------------------- |
| `card`    | string  | yes      | Event card name.                              |
| `spoiler` | boolean | no       | Send the result as a click-to-reveal spoiler. |

Looks up an Event card by name and returns its SICK card image link. Some events share an alias; if a name is ambiguous the bot asks you to be more specific instead of guessing. Set the `spoiler` option to have the bot send the result as a blurred, click-to-reveal spoiler.
