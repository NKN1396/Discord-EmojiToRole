let config

/**
 * 
 * @param {*} messageReaction 
 * @param {*} reactions 
 */
async function setDisjointRoles (messageReaction, reactions) {
  let rolesToRemove = []
  const rolesToAdd = []

  for (const reaction of reactions) {
    if (reaction.emoji === messageReaction.emoji.id) {
      rolesToAdd.concat(reaction.roles)
      continue
    }

    rolesToRemove = [...new Set([...rolesToRemove, ...reaction.roles])]
  }

  const newRoles = []
  messageReaction.message.member.roles.set(newRoles)
}

/**
 * 
 * @param {*} messageReaction The reaction that got added
 * @param {*} user The user that added the reaction
 */
async function handleReactionAdd (messageReaction, user) {
  // Bot should not react to its own reactions.
  if (messageReaction.me) return

  // Check if message is among the ones being tracked
  const scheme = config.get(messageReaction?.message?.id)
  if (scheme === undefined) return

  

  for (const { message, reactions, disjoint } of config) {
    if (message !== ) continue

    if (disjoint) {
      // Add one role, remove all other
      setDisjointRoles(messageReaction, reactions)
    } else {
      // Only add one role
      // member.add(reaction.roles)
    }
  }
}

/**
 * 
 * @param {*} messageReaction The reaction that got removed
 * @param {*} user The user that removed the reaction
 */
async function handleReactionRemove (messageReaction, user) {
  // Bot should not react to its own reactions.
  if (messageReaction.me) return

  const member = messageReaction.message.guild.members.cache.get(user.id)
  const emojiDiscriminator = getEmojiDiscriminator(messageReaction.emoji)

  for (const { disjoint, channel, reactions } of config) {
    // * Make sure we're not in "disjoint" mode
    if (disjoint) continue
    if (channel != messageReaction.message.channel.id) continue
    const rolesToKeep = []
    const rolesToRemove = []
    for (const { emoji, roles } of reactions) {
      if (emojiDiscriminator == emoji) {
        // * Add to removal list
        rolesToRemove.push.apply(rolesToRemove, roles)
      } else {
        // * List of all other roles that should be kept
        rolesToKeep.push.apply(rolesToKeep, roles)
      }
    }
    rolesToRemove.filter((role) =>
    // * Make sure role that is about to be removed is not part of another emoji
      (!rolesToKeep.includes(role)) &&
      // * Make sure member actually has role
      (member.roles.cache.get(role))
    )
    await member.removeRoles(rolesToRemove)
      .catch(error => console.error(error))
  }
}

/**
 * Fetches all messages that need to be tracked into the cache. Makes sure each message is having the proper reactions attached.
 * @param {*} client The bot client
 * @param {*} config The config file
 */
export default function (client, _config) {
  if(config !== undefined) {
    console.error('The tracker has already been initiated and is currently working.')
  }
  config = _config
  client
    .on('messageReactionAdd', handleReactionAdd)
    .on('messageReactionRemove', handleReactionRemove)
}
