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
adversary rules/doubles-notes logic in `commands/AdversaryNames.js`, every
command module's output, and the slash command layer (option-to-args
translation, interaction replies, and the spoiler middleware). It runs
against plain Node, no Docker required:

- `npm install`
- `npm test`

To run a single file or filter by test name (useful while iterating):

- `npx jest tests/doublesNotes.test.js`
- `npx jest -t "Sweden 4"`

If you're working inside the dev container (see above), run the same
commands there instead — `npm install` already ran during the image build,
so `npm test` alone is usually enough.

### Slash commands

The bot registers its slash commands with Discord itself on startup, so a
deploy that adds a command or changes an option takes effect on its own.

Two env vars control this (see `.env.template`):

- `DISCORD_GUILD_ID` — register to a single server instead of globally.
  Guild registrations appear immediately, where global ones can take up to
  an hour to propagate, so set this while developing and leave it blank in
  production.
- `DISCORD_CLIENT_ID` — only needed by `npm run commands:deploy`, the
  manual registration script (`scripts/deployCommands.cjs`). Use it to push
  command definitions without restarting the bot.

A command module declares the options Discord should collect as an
`options` array (or `subcommands`, as `/random` does);
`utils/slashCommands.cjs` turns those into Discord's command definitions,
and turns a user's filled-in options back into the positional `args` array
the module's `execute` reads. Adding a command means writing the module —
registration, `/help` and the docs all follow from its own exports.

Note that migrating to slash commands dropped the privileged
`MessageContent` gateway intent, which the bot no longer needs: it is only
sent the commands people explicitly run, not every message in a channel.

### Deploy changelog announcements

When a change is merged to `main`, the `deploy.yml` workflow deploys the new
image and then POSTs the list of merged commits to the bot's
`/webhook/deploy` endpoint (authenticated with the `DEPLOY_WEBHOOK_SECRET`
env var / GitHub secret). The bot then posts that changelog to every server
it's in - the system channel if it can, otherwise the topmost text channel
it has permission to post in. See `scripts/notifyDeploy.cjs` and
`utils/broadcast.cjs`.

### Bot Commands

All of these are Discord slash commands: type `/` in any channel the bot is
in and Discord will offer them, with each command's options as named,
validated fields. Run `/help` for this same list, or `/help command:<name>`
for a description of what a specific command does.

`<angle brackets>` mark a required option and `[square brackets]` an
optional one. This section is generated from the same option declarations
the bot registers with Discord — after adding or changing a command's
`options` export, run `npm run docs:generate` to update it (and the
[full command reference](https://thirdratecyberpunk.github.io/SI_Card_Bot/)
site under `docs/`) rather than editing it by hand.

<!-- COMMANDS:START -->

- `/adversary [adversary]`
- `/adversaryrules <leading> <leading_level> [supporting] [supporting_level] [nosetup]`
- `/aspect <aspect> [card]`
- `/aspects [spirit]`
- `/blight <card>`
- `/board [board]`
- `/card <card>`
- `/choose <number>`
- `/draw <type> [amount]`
- `/dtnw [players]`
- `/event <card> [spoiler]`
- `/faq [search]`
- `/fear [card] [level] [spoiler]`
- `/feardeck <leading> <leading_level> [supporting] [supporting_level]`
- `/healing <card> [side]`
- `/help [command]`
- `/incarna <spirit> [side]`
- `/invaderdeck <leading> <leading_level> [supporting] [supporting_level]`
- `/major <card>`
- `/minor <card>`
- `/power <card>`
- `/progression <spirit>`
- `/random`
  - `spirit [max_complexity]`
  - `adversary [min_difficulty] [max_difficulty]`
  - `double [min_difficulty] [max_difficulty]`
  - `scenario`
  - `board [type]`
- `/reactionrole`
- `/scenario <scenario> [side]`
- `/search <query> [spoiler]`
- `/spirit [spirit] [side]`
- `/take <type>`
- `/unique <card>`
- `/uniques <spirit>`
<!-- COMMANDS:END -->

The full reference site (one page per command, generated into `docs/`) is
served via GitHub Pages.

# License

Licensed under MIT license (LICENSE-MIT or http://opensource.org/licenses/MIT) with parts copyrighted by Greater Than Games, LLC.

All images and some text belongs to Greater Than Games, LLC.
