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

async function fetchMessageReactionMember(messageReaction, user) {
  const message = await messageReaction.message.fetch()
  const guild = await message.guild.fetch()
  return await guild.members.fetch(user.id)
}

/**
 * Handles reaction addition
 * @param {*} messageReaction The MessageReaction that got added
 * @param {*} user The User that added their reaction
 */
async function handleReactionAdd (messageReaction, user) {
  // Bot should never handle its own reactions
  // This might happen when the bot sets up a message initially
  if (user.id === user.client.id) return

  // Check if message is among the ones being tracked
  const messageScheme = config.get(messageReaction?.message?.id)
  if (messageScheme === undefined) return

  if (messageScheme.disjoint) {
    // Add one role, remove all other
    setDisjointRoles(messageReaction, reactions)
  } else {
    // Only add one role
    // member.add(reaction.roles)
  }
}

/**
 * Handles reaction removal
 * @param {*} messageReaction The MessageReaction that got removed
 * @param {*} user The User that removed their reaction
 */
async function handleReactionRemove (messageReaction, user) {
  // Bot should not react to its own reactions
  if (user.id === user.client.id) return

  // Check if message is among the ones being tracked
  const messageScheme = config.get(messageReaction?.message?.id)
  if (messageScheme === undefined) return

  // No roles need to be removed in disjoint mode
  if (messageScheme.disjoint) return
  // We're in independent mode

  // Acquire roles to remove
  const emojiIdentifier = messageReaction.emoji.identifier
  const roles = messageScheme.reactions.get(emojiIdentifier)
  if (roles === null) return

  // Only remove one set of roles
  const member = fetchMessageReactionMember(messageReaction, user)
  member.roles.remove(roles)
    .catch(console.error)
}

/**
 * Tracks and handles all reactions to all messages
 * @param {*} client The bot client
 * @param {*} config The config scheme
 */
export default function (client, _config) {
  // Prevent configuration from being empty
  if (_config === undefined) {
    console.error('Configuration can not be empty.')
    return
  }

  // Prevent tracker from being called twice on accident
  if (config !== undefined) {
    console.error('The tracker has already been initiated and is currently working.')
    return
  }

  // Start tracking
  config = _config
  console.log("TRACKING!")
  client
    .on('messageReactionAdd', handleReactionAdd)
    .on('messageReactionRemove', handleReactionRemove)
}

async function newFunction () {
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