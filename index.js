import { Client } from "discord.js"

const bot = new Client()

import config from "./config.json"

//Fetch messages that need to be tracked and cache them.
import fetchMessages from "./src/load"
fetchMessages(bot, config)

//Start tracking messages by hooking an event listener to them
import track from "./src/track"
track(bot, config)

import token from "./token.json"

bot.login(token)
	.then(() => {
		console.log(`Logged in as ${bot.user.tag}`)
	})
	.catch( console.error() )
