---
title: "/search"
layout: default
---

[← Back to command list](../index.html)

# /search

search the SICK library

## Usage

```
/search <query> [spoiler]
```

## Options

| Option    | Type    | Required | Description                                         |
| --------- | ------- | -------- | --------------------------------------------------- |
| `query`   | string  | yes      | Search terms; run with 'help' for the query syntax. |
| `spoiler` | boolean | no       | Send the result as a click-to-reveal spoiler.       |

Builds a link to search sick.oberien.de's card catalog for the given words (spaces become %20 in the URL). Run `/search query:help` to see the supported query syntax - quoted phrases, and filters like `elements:`, `range:`, `cost:` and `target:`. Set the `spoiler` option to have the bot send the result as a blurred, click-to-reveal spoiler.
