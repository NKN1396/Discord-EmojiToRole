// External dependencies
import { Client, GatewayIntentBits, Partials } from 'discord.js'

// Internal dependencies
import parseConfig from './src/restructureConfig.mjs'
// import fetchMessages from './src/loadMessages.mjs'
import trackReactions from './src/trackReactions.mjs'

// Configuration
import CONFIG from './config.mjs'
import TOKEN from './token.mjs'

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User]
})
const messageScheme = parseConfig(CONFIG)
// fetchMessages(bot, config)
trackReactions(bot, messageScheme)

bot.login(TOKEN)
  .then(() => {
    console.log(`Logged in as ${bot.user.tag}`)
  })
  .catch(error => {
    console.error('There was an error while trying to log in.')
    console.error(error)
  })
