# SI_Card_Bot

A bot to retrieve Spirit Island cards and panels from Spirit Island Card Katalog (https://sick.oberien.de/) and Imgur(for now) and other useful SI related utilities.

**Invite code**: https://discord.com/oauth2/authorize?client_id=1120665987331661904&permissions=292058114048&integration_type=0&scope=bot

### How to run the bot

You will need [Docker](https://www.docker.com/) installed and a [Discord Developer API](https://docs.discord.com/developers/reference) key.

- Clone this repo
- Copy `.env.template` into `.env` and fill in the variables
- `docker-compose up -d --build`

### Local development

`docker-compose.yml` (used above) runs a pre-built production image with no
live code mounting - editing source won't do anything until you rebuild.

For active development, use `docker-compose.dev.yml` instead: it builds the
`dev` image stage, bind-mounts your working directory into the container, and
runs the bot via `tsx` watch mode, so code changes are picked up automatically
without a rebuild or manual restart.

- `docker compose -f docker-compose.dev.yml up -d --build` (rebuild only needed when dependencies change, e.g. `package.json`)
- `docker compose -f docker-compose.dev.yml logs -f` to follow output
- `docker compose -f docker-compose.dev.yml down` to stop

Alternatively, open the repo in VS Code with the
[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
extension installed and run **Dev Containers: Reopen in Container** — this
uses the same `docker-compose.dev.yml` setup under `.devcontainer/`, giving
you an integrated terminal/debugger inside the container with the bot
already running via tsx watch mode.

### Running tests

The test suite (Jest) covers the deck/fear-deck calculations and the
adversary rules/doubles-notes logic in `commands/AdversaryNames.js`. It runs
against plain Node, no Docker required:

- `npm install`
- `npm test`

To run a single file or filter by test name (useful while iterating):

- `npx jest tests/doublesNotes.test.js`
- `npx jest -t "Sweden 4"`

If you're working inside the dev container (see above), run the same
commands there instead — `npm install` already ran during the image build,
so `npm test` alone is usually enough.

### Deploy changelog announcements

When a change is merged to `main`, the `deploy.yml` workflow deploys the new
image and then POSTs the list of merged commits to the bot's
`/webhook/deploy` endpoint (authenticated with the `DEPLOY_WEBHOOK_SECRET`
env var / GitHub secret). The bot then posts that changelog to every server
it's in - the system channel if it can, otherwise the topmost text channel
it has permission to post in. See `scripts/notifyDeploy.cjs` and
`utils/broadcast.cjs`.

### Bot Commands

Run `-help` in Discord for this same list, or `-help <command>` for a
description of what a specific command does. This section is generated from
the same command metadata — after adding or changing a command's `usage`
export, run `npm run docs:generate` to update it (and the
[full command reference](https://thirdratecyberpunk.github.io/SI_Card_Bot/)
site under `docs/`) rather than editing it by hand.

<!-- COMMANDS:START -->

- `-adversary (adversary name)`
- `-adversaryrules (leadingAdversary leadingAdversaryLevel) (supportingAdversary supportingAdversaryLevel) (nosetup)`
- `-aspect (aspect name|emoji) [card number]`
- `-aspects (spirit name)`
- `-blight [card name]`
- `-board [board letter/name]`
- `-card [card name]`
- `-choose [number]`
- `-draw [card type] [amount (<=10)]`
- `-dtnw [player count]`
- `-event [event name]`
- `-faq (search words)`
- `-fear (fear name) (level)`
- `-feardeck (leadingAdversary leadingAdversaryLevel) (supportingAdversary supportingAdversaryLevel)`
- `-healing [keyword] (front/back)`
- `-help [command name]`
- `-incarna [keyword] (front/back)`
- `-invaderdeck (leadingAdversary leadingAdversaryLevel) (supportingAdversary supportingAdversaryLevel)`
- `-major [card name]`
- `-minor [card name]`
- `-power [card name]`
- `-progression (spirit)`
- `-random`
  - `spirit (max complexity (low/moderate/high/vhc))`
  - `adversary (min difficulty) (max difficulty)`
  - `double (min difficulty) (max difficulty)`
  - `scenario`
  - `board (all/thematic (defaults to regular))`
- `-reactionrole`
- `-scenario (front/back) [keywords]`
- `-search [search words]`
- `-spirit (front/back) [keywords]`
- `-take [card type]`
- `-unique [card name]`
- `-uniques (spirit name)`
<!-- COMMANDS:END -->

The full reference site (one page per command, generated into `docs/`) is
served via GitHub Pages.

# License

Licensed under MIT license (LICENSE-MIT or http://opensource.org/licenses/MIT) with parts copyrighted by Greater Than Games, LLC.

All images and some text belongs to Greater Than Games, LLC.
