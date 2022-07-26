// External dependencies
import { Client, GatewayIntentBits, Partials } from 'discord.js'

// Internal dependencies
import parseConfig from './src/restructureConfig.mjs'
import trackReactions from './src/trackReactions.mjs'

// Configuration
import CONFIG from './config.mjs'
import TOKEN from './token.mjs'
import checkMessages from './src/checkMessages.mjs'

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.User]
})

const messageScheme = parseConfig(CONFIG)

// Start tracking messages by adding event listeners
trackReactions(bot, messageScheme)

bot.login(TOKEN)
  .then(() => {
    console.log(`Logged in as ${bot.user.tag}`)

    // Check all messages if the bot has still reacted to them
    checkMessages(bot, messageScheme)
  })
  .catch(error => {
    console.error('There was an error while trying to log in')
    console.error(error)
  })
