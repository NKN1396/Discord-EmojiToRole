let config

/**
 * Set the roles in disjoint mode.
 * @param {*} member The member that reacted
 * @param {*} rolesToAdd An array of roles that should be granted to the member
 * @param {*} reactions A map of possible reactions to this message (config.reactions)
 * @param {*} messageReaction The messageReaction that prompted this function call
 */
async function setDisjointRoles (member, rolesToAdd, reactions, messageReaction) {
  /**
   * This is going to be quite complicated, so I'll do some explaining here.
   * We need to both add and remove certain roles in disjoint mode. This could
   * be done in two seperate API calls, but that would allow for illegal states
   * and it would be slower. Instead, we can set all roles in a single API call.
   * However, this requires us to figure out everything beforehand.
   *
   * Essentially, we have three different groups of roles to account for:
   * 1. The set of roles that are unrelated and we shouldn't touch.
   * 2. The set of roles that we need to remove in disjoint mode.
   * 3. The set of roles that were requested by the member and should be added.
   *
   * This can be done the following way:
   * 1. Acquire current member roles
   * 2. Subtract all roles that could be acquired
   * 3. Add roles according to current reaction
   */

  // Acquire current member roles
  const roles = new Set(member.roles.cache.keys()) // Includes @everyone

  // Acquire roles to remove
  let rolesToRemove = Array.from(reactions.values())
  rolesToRemove = rolesToRemove.flat()
  for (const roleToRemove of rolesToRemove) {
    roles.delete(roleToRemove)
  }

  // Acquire roles to add
  for (const roleToAdd of rolesToAdd) {
    roles.add(roleToAdd)
  }

  // Apply roles
  const newRoles = Array.from(roles)
  await member.roles.set(newRoles)
    .catch(error => {
      console.error(`Error setting roles for member ${member.displayName}. Is the bot maybe missing the "manage roles" permission?`)
      throw error
    })

  // Remove reaction (instant feedback)
  const user = member.user
  await messageReaction.users.remove(user)
    .catch(error => {
      console.error(`Error removing reaction for member ${member.displayName}. Is the bot maybe missing the "manage messages" permission?`)
      throw error
    })
}

/**
 * Gets the roles associated with a specific reaction from a scheme
 * @param {*} messageReaction The MessageReaction
 * @param {*} messageScheme The scheme (config)
 * @returns The roles associated with that MessageReaction
 */
function getReactionRoles (messageReaction, messageScheme) {
  const emojiIdentifier = messageReaction.emoji.identifier
  const reactionRoles = messageScheme.reactions.get(emojiIdentifier)
  return reactionRoles
}

/**
 * Gets the member that reacted to the message
 * @param {*} messageReaction The MessageReaction
 * @param {*} user The User
 * @returns The member
 */
async function fetchMessageReactionMember (messageReaction, user, force = false) {
  const message = await messageReaction.message.fetch()
  const guild = await message.guild.fetch()
  /**
   * Force requesting the member from the API might be necessary, as the list of
   * roles this member has might be incomplete. This leads to inconsistensies
   * when calling GuildMemberRoleManager.set, GuildMemberRoleManager.add(Array)
   * or GuildMemberRoleManager.remove(Array).
   */
  return await guild.members.fetch({ user, force })
}

/**
 * Adds an array of one or more roles to a member. Requires proper handling of
 * cache before calling.
 * @param {*} member The GuildMember
 * @param {*} rolesToAdd An array of Roles
 */
async function addMemberRoles (member, rolesToAdd) {
  if (rolesToAdd.length === 1) {
    // Add single role
    await member.roles.add(rolesToAdd[0])
    return
  }
  // Add multiple roles
  await member.roles.remove(rolesToAdd)
}

/**
 * Handles reaction addition
 * @param {*} messageReaction The MessageReaction that got added
 * @param {*} user The User that added their reaction
 */
async function handleReactionAdd (messageReaction, user) {
  // Bot should never handle its own reactions
  // This might happen when the bot sets up a message initially
  const myId = user.client.user.id
  if (user.id === myId) return

  // Check if message is among the ones being tracked
  const messageScheme = config.get(messageReaction?.message?.id)
  if (messageScheme === undefined) return

  // Acquire roles to add
  const rolesToAdd = getReactionRoles(messageReaction, messageScheme)
  if (rolesToAdd === undefined) return

  // Acquire member
  let forceFetch = false
  if (rolesToAdd.length !== 1) forceFetch = true
  if (messageScheme.disjoint) forceFetch = true
  let member
  try {
    member = await fetchMessageReactionMember(messageReaction, user, forceFetch)
  } catch (error) {
    console.error(`Error fetching member of user ${user.tag}.`)
    console.error(error)
    return
  }

  // Add roles
  if (messageScheme.disjoint) {
    // Add one role, remove all other
    setDisjointRoles(member, rolesToAdd, messageScheme.reactions, messageReaction)
      .catch(console.error)
  } else {
    // We're in independent mode
    // Only add one set of roles
    addMemberRoles(member, rolesToAdd)
      .catch(error => {
        console.error(`Error adding roles for member ${member.displayName}. Is the bot maybe missing the "manage roles" permission?`)
        console.error(error)
      })
  }
}

/**
 * Removes an array of one or more roles to a member. Requires proper handling
 * of cache before calling.
 * @param {*} member The GuildMember
 * @param {*} rolesToAdd An array of Roles
 */
async function removeMemberRoles (member, rolesToRemove) {
  if (rolesToRemove.length === 1) {
    // Remove single role
    await member.roles.remove(rolesToRemove[0])
    return
  }
  // Remove multiple roles
  await member.roles.remove(rolesToRemove)
}

/**
 * Handles reaction removal
 * @param {*} messageReaction The MessageReaction that got removed
 * @param {*} user The User that removed their reaction
 */
async function handleReactionRemove (messageReaction, user) {
  // Bot should not react to its own reactions
  const myId = user.client.user.id
  if (user.id === myId) return

  // Check if message is among the ones being tracked
  const messageScheme = config.get(messageReaction?.message?.id)
  if (messageScheme === undefined) return

  // No roles need to be removed in disjoint mode
  if (messageScheme.disjoint) return
  // We're in independent mode

  // Acquire roles to remove
  const rolesToRemove = getReactionRoles(messageReaction, messageScheme)
  if (rolesToRemove === undefined) return

  // Fetch member
  let forceFetch = false
  if (rolesToRemove.length !== 1) forceFetch = true
  let member
  try {
    member = await fetchMessageReactionMember(messageReaction, user, forceFetch)
  } catch (error) {
    console.error(`Error fetching member of user ${user.tag}.`)
    console.error(error)
    return
  }

  // Only remove one set of roles
  removeMemberRoles(member, rolesToRemove)
    .catch(error => {
      console.error(`Error removing roles for member ${member.displayName}. Is the bot maybe missing the "manage roles" permission?`)
      console.error(error)
    })
}

/**
 * Tracks and handles all reactions to all messages
 * @param {*} client The bot client
 * @param {*} config The config scheme
 */
export default function (client, _config) {
  // Prevent configuration from being empty
  if (_config === undefined) {
    console.error('Configuration can not be empty')
    return
  }

  // Prevent tracker from being called twice on accident
  if (config !== undefined) {
    console.error('The tracker has already been initiated and is currently working')
    return
  }

  // Start tracking
  config = _config
  client
    .on('messageReactionAdd', handleReactionAdd)
    .on('messageReactionRemove', handleReactionRemove)
}
