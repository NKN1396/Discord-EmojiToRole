/**
 * Returns a unique discriminator string that can be used to distinguish between custom emojis.
 * @param {Object} emoji The emoji used as the reaction to the message.
 * @returns {String} The discriminator.
 */
function getEmojiDiscriminator(emoji) {
	if (emoji.id) {
		return `${emoji.name}:${emoji.id}`;
	} else {
		return emoji.name;
	}
}

/**
 * Fetches all messages that need to be tracked into the cache. Makes sure each message is having the proper reactions attached.
 * @param {*} client The bot client.
 * @param {*} config The config file.
 */
module.exports = function(client, config) {
	/* eslint-disable no-multiple-empty-lines*/
	client
		.on("messageReactionAdd", (messageReaction, user) => {
			//Bot should not react to its own reactions.
			if (user == client.user) return;
			var member = messageReaction.message.guild.members.get(user.id);
			var emojiDiscriminator = getEmojiDiscriminator(messageReaction.emoji);
			(async () => {
				for (var bundle of config) {
					if (bundle.channel != messageReaction.message.channel.id) continue;
					var rolesToAdd = [];
					var rolesToRemove = [];
					for (var reaction of bundle.reactions) {
						if (emojiDiscriminator == reaction.emoji) {
							rolesToAdd.push.apply(rolesToAdd, reaction.roles); //Prototyping the push function, might be buggy
						} else if (bundle.disjoint) {
							//Roles shall be handled mutually exclusive
							rolesToRemove.push.apply(rolesToRemove, reaction.roles);
						}
					}
					await member.addRoles(rolesToAdd.filter((role) =>
						//Only add roles that the member does not yet have
						(!member.roles.get(role))
					));
					//Check to see if roles are handled mutually eclusive
					if (!bundle.disjoint) continue;
					//Make sure none of the roles on the "add" list get removed again
					await member.removeRoles(rolesToRemove.filter((role) =>
						//Member already has role that is about to be removed
						(member.roles.get(role)) &&
						//Role about to be removed is not on the whitelist
						(!rolesToAdd.includes(role))
					));
					await messageReaction.remove(user);
					//Don't use this, or otherwise there will only be a single message per channel.
					//break;
				}
			})();
		})
		/*
		.on("messageReactionRemove", (messageReaction, user) => {
			//Bot should not react to its own reactions.
			if (user == client.user) return;
			var member = messageReaction.message.guild.members.get(user.id);
			var emojiDiscriminator = getEmojiDiscriminator(messageReaction.emoji);

			(async () => {
				for (var bundle of config) {
					if (bundle.channel != messageReaction.message.channel.id) continue;
					var rolesToAdd = [];
					var rolesToRemove = [];
					for (var reaction of bundle.reactions) {
						if (emojiDiscriminator == reaction.emoji) {
							rolesToAdd.push.apply(rolesToAdd, reaction.roles); //Prototyping the push function, might be buggy
						} else if (bundle.disjoint) {
							//Roles shall be handled mutually exclusive
							rolesToRemove.push.apply(rolesToRemove, reaction.roles);
						}
					}
					await member.addRoles(rolesToAdd);
					//Check to see if roles are handled mutually eclusive
					if(!bundle.disjoint) continue;
					//Make sure none of the roles on the "add" list get removed again
					rolesToRemove.filter((role) =>
						(!rolesToAdd.includes(role))
					);
					await member.removeRoles(rolesToRemove);
					await messageReaction.remove(user);
					//Don't use this, or otherwise there will only be a single message per channel.
					//break;
				}
			})();

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
		})//*/
	;
};
