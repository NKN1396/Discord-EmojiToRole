//ADD for more roles


const Discord = require("discord.js");

const bot = new Discord.Client();

let ID_channel_messageToTrack = "414617785415630855";
let ID_message_toTrack = "446409003136712726";
let ID_guild = "299298454457548801";
let ID_role_1 = "446783613439311882";
let ID_role_2 = "446783667084197910";
let reaction_1 = "🤔"; //Thinking (default Discord) Emoji
let reaction_2 = "b26:441046394493599764"; //Custom Emoji - use name:ID format only

bot.login(require("./token.json"))
	.then(() => {
		console.log(`Logged in as ${bot.user.tag}`);
	});

function getEmojiDiscriminator(emoji){
	if(emoji.id){
		return `${emoji.name}:${emoji.id}`;
	}
	else{
		return emoji.name;
	}
}

bot
	.on("ready", () => {
		console.log("Fetching message...");
		//Fetch message into cache so the bot keeps track of it.
		bot.channels.get(ID_channel_messageToTrack).fetchMessage(ID_message_toTrack).then((message) => {
			//Check if the bots own reactions still exist.
			var reactions = [reaction_1, reaction_2];
			console.log("This bot uses EcmaScript 2017. If you don't see \"ASYNC WORKING!\" next, you might have to update node.js.");
			(async () => {
				//Anonymous async/await function - Holy shit, I love ECMAscript 2017
				console.log("ASYNC WORKING!");
				for(var reaction of reactions){
					var messageReaction = message.reactions.get(reaction);
					//In case reaction does not exist
					if(!messageReaction){
						await message.react(reaction);
						//No fetch necessary since no prior existing reactions.
					}
					else{
						if(!messageReaction.me){
							//Fetch each reaction into cache to keep track of them
							messageReaction.fetchUsers();
							await message.react(reaction);
						}
					}
				}
			})();
		});
	})
	.on("messageReactionAdd", (messageReaction, user) => {
		//Bot should not react to its own reactions.
		if(user == bot.user) return;
		var member = bot.guilds.get(ID_guild).members.get(user.id);
		var emojiDiscriminator = getEmojiDiscriminator(messageReaction.emoji);
		console.log(emojiDiscriminator);
		if(emojiDiscriminator == reaction_1)
		{
			if(member.roles.get(ID_role_1)) return; //Member already has role for some reason?
			member.addRole(ID_role_1)
				.then(() => {
					if(member.roles.get(ID_role_2)){
						member.removeRole(ID_role_2)
							.then(() => {
								messageReaction.message.reactions.get(reaction_2).remove(user.id);
								console.log("2 REMOVED");
							});
					}
					console.log("1 ADDED");
				});
		}
		else if(emojiDiscriminator == reaction_2)
		{
			if(member.roles.get(ID_role_2)) return; //Member already has role for some reason?
			member.addRole(ID_role_2)
				.then(() => {
					if(member.roles.get(ID_role_1)){
						member.removeRole(ID_role_1)
							.then(() => {
								messageReaction.message.reactions.get(reaction_1).remove(user.id);
								console.log("1 REMOVED");
							});
					}
					console.log("2 ADDED");
				});
		}
	})
	.on("messageReactionRemove", (messageReaction, user) => {

		//Bot should not react to its own reactions.
		if(user == bot.user) return;
		var member = bot.guilds.get(ID_guild).members.get(user.id);
		var emojiDiscriminator = getEmojiDiscriminator(messageReaction.emoji);
		if(emojiDiscriminator == reaction_1)
		{
			if(member.roles.get(ID_role_1)){
				member.removeRole(ID_role_1);
				console.log("1 REMOVED");
			}
		}
		else if(emojiDiscriminator == reaction_2)
		{
			if(member.roles.get(ID_role_2)){
				member.removeRole(ID_role_2);
				console.log("2 REMOVED");
			}
		}
	});
