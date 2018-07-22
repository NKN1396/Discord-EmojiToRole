var Discord = require("discord.js");

var bot = new Discord.Client();

const config = require("./config.json");

var load = require("./src/load");
load(bot, config);

var track = require("./src/track");
track(bot, config);

bot.login(require("./token.json"))
	.then(() => {
		console.log(`Logged in as ${bot.user.tag}`);
	});
