/**
 * Makes sure each message is having the proper reactions attached. This should only be called once the client ist ready.
 * @param {*} client The bot client
 * @param {*} config The config scheme
 */
export default async function (client, config) {
  console.log('Checking all messages')

  for (const [messageId, messageScheme] of config) {
    // Fetch channel
    const channelId = messageScheme.channel
    let channel
    try {
      channel = await client.channels.fetch(channelId)
    } catch (error) {
      console.error(`Error fetching channel with ID ${channelId}. Does the channel still exist? Does the bot have access to it?`)
      console.error(error)
      return
    }

    // Fetch message
    let message
    try {
      message = await channel.messages.fetch(messageId)
    } catch (error) {
      console.error(`Error fetching message with ID ${messageId}. Does the message still exist? Does the bot have access to it?`)
      console.error(error)
      return
    }

    // Add missing emojis
    const emojis = messageScheme.reactions.keys()
    for (const emoji of emojis) {
      await message.react(emoji)
        .catch(error => {
          console.error(`Error reacting to message with ID ${messageId} with emoji ${emoji}.`)
          console.error(error)
        })
    }
  }

  console.log('Done checking messages')
}
