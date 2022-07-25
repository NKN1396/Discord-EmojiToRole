/**
 * Fixes possible errors in emoji strings by matching them to a pattern.
 * @param {String} emojiDiscriminator The string from the config file.
 * @returns {*} A proper emojiDiscriminator or null.
 */
function cleanEmojiDiscriminator (emojiDiscriminator) {
  const regEx = /[A-Za-z0-9_]+:[0-9]+/
  const cleaned = regEx.exec(emojiDiscriminator)
  if (cleaned) return cleaned[0]
  return emojiDiscriminator
}

/**
 * Fetches all messages that need to be tracked into the cache. Makes sure each message is having the proper reactions attached.
 * @param {*} client The bot client.
 * @param {*} config The config file.
 */
export default function (client, config) {
  client
    .on('ready', async function () {
      console.log('Fetching messages')
      let fetchedMessageCount = 0
      for (const { channel, message: messageId, reactions } of config) {
        const message = await client.channels.cache.get(channel).messages.fetch(messageId)
          .catch(error => console.error(error))
        if (!message) continue
        ++fetchedMessageCount
        for (let { emoji } of reactions) {
          emoji = cleanEmojiDiscriminator(emoji)
          const messageReaction = message.reactions.cache.get(emoji)
          if (!messageReaction) {
            await message.react(emoji)
              .catch(console.error())
            // No fetch necessary since no prior existing reactions.
          } else {
            if (!messageReaction.me) {
              // Fetch each reaction into cache to keep track of them
              messageReaction.users.fetch({ limit: 50 })
              await message.react(emoji)
                .catch(console.error())
            }
          }
        }
      }
      console.log(`Done fetching ${fetchedMessageCount} message(s).`)
    })
}
