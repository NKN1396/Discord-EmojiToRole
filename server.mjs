// External dependencies
import { Client } from 'discord.js'

// Internal dependencies
import parseConfig from './src/restructureConfig.mjs'
import fetchMessages from './src/loadMessages.mjs'
//import track from './src/track.js'

// Configuration
import config from './config.mjs'
//import token from './token.json'

/*
const bot = new Client()
fetchMessages(bot, config)
track(bot, config)

bot.login(token)
  .then(() => {
    console.log(`Logged in as ${bot.user.tag}`)
  })
  .catch(error => {
    console.error('There was an error while trying to log in.')
    console.error(error)
  })
*/

const messageScheme = parseConfig(config)
console.log(messageScheme)


