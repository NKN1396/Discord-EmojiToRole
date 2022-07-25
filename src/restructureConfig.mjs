/**
 * Restructures the config for efficient and easy browsing.
 * @param {*} config The parsed configuration.
 * @returns A map ordered by message IDs as key.
 */
export default function (config) {
  const messageScheme = new Map()

  for (const { message, channel, disjoint, reactions } of config) {
    const reactionLibrary = new Map()
    createReactions(reactions, reactionLibrary)

    const info = {
      channel: channel,
      disjoint: disjoint,
      reactions: reactionLibrary
    }
    messageScheme.set(message, info)
  }

  return messageScheme
}

/**
 * 
 * @param {*} reactions 
 * @param {*} reactionLibrary 
 */
function createReactions (reactions, reactionLibrary) {
  for (const reaction of reactions) {
    reactionLibrary.set(reaction.emoji, reaction.roles)
  }
}
