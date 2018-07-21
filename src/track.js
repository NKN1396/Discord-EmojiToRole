function getEmojiDiscriminator(emoji){
	if(emoji.id){
		return `${emoji.name}:${emoji.id}`;
	}
	else{
		return emoji.name;
	}
}


/**
 * Fetches all messages that need to be tracked into the cache. Makes sure each message is having the proper reactions attached.
 * @param {*} client The bot client.
 * @param {*} config The config file.
 */
module.exports = function(client, config){
	/* eslint-disable no-multiple-empty-lines*/
	client
		.on("messageReactionAdd", (messageReaction, user) => {
			//Bot should not react to its own reactions.
			if(user == client.user) return;
			var member = messageReaction.message.guild.members.get(user.id);
			var emojiDiscriminator = getEmojiDiscriminator(messageReaction.emoji);
			(async () => {
				for(var bundle of config){
					if(bundle.channel != messageReaction.message.channel.id) continue;
					for(var reaction of bundle.reactions){
						var rolesToAdd = [];
						var rolesToRemove = [];
						if(emojiDiscriminator == reaction){
							rolesToAdd.push.apply(reaction.roles); //Prototyping the push function, might be buggy
						}
						else{
							rolesToRemove.push.apply(reaction.roles);
						}
					}
					//Remove all roles on the adding list from the removal list
					rolesToRemove.filter((role) => 
						(!rolesToAdd.includes(role))
					);
					await member.addRoles(rolesToAdd);
					if(bundle.disjoint) await member.removeRoles(rolesToRemove);

					//Don't use this, or otherwise there will only be a single message per channel.
					//break;
				}
			})();
		});

	/*
		.on("messageReactionRemove", (messageReaction, user) => {

			//Bot should not react to its own reactions.
			if(user == client.user) return;
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
		*/
};
