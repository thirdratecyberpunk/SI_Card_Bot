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
runs the bot via `nodemon`, so code changes are picked up automatically
without a rebuild or manual restart.

- `docker compose -f docker-compose.dev.yml up -d --build` (rebuild only needed when dependencies change, e.g. `package.json`)
- `docker compose -f docker-compose.dev.yml logs -f` to follow output
- `docker compose -f docker-compose.dev.yml down` to stop

Alternatively, open the repo in VS Code with the
[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
extension installed and run **Dev Containers: Reopen in Container** — this
uses the same `docker-compose.dev.yml` setup under `.devcontainer/`, giving
you an integrated terminal/debugger inside the container with the bot
already running via nodemon.

### Bot Commands

- -search [search words]
- -draw [card type] [amount (<=10)]
- -dtnw [player count]
- -power [card name]
- -minor [card name]
- -major [card name]
- -unique [card name]
- -uniques [spirit name]
- -blight [card name]
- -board [board letter/name]
- -event [event name]
- -fear [fear name]
- -faqs (search words)
- -random spirit (max complexity (low/moderate/high/vhc))
- -random adversary (min difficulty) (max difficulty)
- -random double (min difficulty) (max difficulty)
- -random scenario
- -random board (all/thematic (defaults to regular))
- -spirit (front/back) [keywords]
- -adversary (adversary name) \
- -adversaryrules (leadingAdversary leadingAdversaryLevel supportingAdversary supportingAdversaryLevel) \
- -aspect (aspect name) [number of card (i.e. Locus part 1/2)]
- -aspects (spirit name)
- -healing [keyword]
- -incarna [keyword] (front/back)
- -scenario (front/back) [keywords]
- -invaderdeck (leadingAdversary leadingAdversaryLevel supportingAdversary supportingAdversaryLevel)
- -progression (spirit)
- -fearDeck (leadingAdversary leadingAdversaryLevel supportingAdversary supportingAdversaryLevel)
