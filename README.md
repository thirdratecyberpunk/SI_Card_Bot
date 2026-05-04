# SI_Card_Bot

Discord App for Spirit island

**Invite code**: https://discord.com/oauth2/authorize?client_id=1120665987331661904&permissions=292058114048&integration_type=0&scope=bot

### How to run the bot

You will need [Docker](https://www.docker.com/) installed and a [Discord Developer API](https://docs.discord.com/developers/reference) key.

- Clone this repo
- Copy `.env.template` into `.env` and fill in the variables
- `docker-compose up -d --build`

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
- -adversary (name)
- -aspect (aspect name) [number of card (i.e. Locus part 1/2)]
- -aspects (spirit name)
- -healing [keyword]
- -incarna [keyword] (front/back)
- -scenario (front/back) [keywords]
- -invaderdeck (leadingAdversary leadingAdversaryLevel supportingAdversary supportingAdversaryLevel)
- -progression (spirit)
- -fearDeck (leadingAdversary leadingAdversaryLevel supportingAdversary supportingAdversaryLevel)
