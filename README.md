# EmojiToRole
A discord.js bot that assigns roles based on reactions to a message.
It is inspired by Zira, a bot with similar functionality, but instead with a focus on ease of use.

The main features are:
* No other dependencies required
* Static configuration with a single file
* No privileged intents required
* Small code base
* Easy to maintain

## Features
This bot offers two different modes of operation. The mode can be set independently for every message:

### Disjoint (mutually exclusive)
* Makes sure that the member can only ever pick one of the given choices.
* Picking a different option removes the other.
* Message reactions get removed immediately.
*Example: choosing a team*

### Independent
* Members can pick as many from the given choices as they like.
* All roles are kept and reactions stay.
* Removing the reaction causes the respective role(s) to be removed again.
*Example: selecting alert roles*

## Setup
To run it simply install all dependencies (`npm i`) before using `npm start`.

### Token
Provide your token to the `token.mjs` file.

### Configuration
All messages to track and their respective settings go into the `config.mjs` file.
The bot tracks reactions on a per-message basis. The configuration for a single message looks like this:
```javascript
{
  message: '446409003136712726',
  channel: '414617785415630855',
  disjoint: false,
  reactions: [
    {
      emoji: '%F0%9F%A4%94', // Thinking emoji 🤔
      roles: ['1001065452472111134']
    }, {
      emoji: 'SelenHappy:901432850396639232', // Custom guild emoji
      roles: ['1001065583422492794']
    }
  ]
}
```
In order to add more messages, simply paste the Object above into the Array in `config.mjs`.

Key:
* **message**: ID of the message to track
* **channel**: ID of the channel the message is located in
* **disjoint**: Wether the bot runs in mutually exclusive (true) or independent (false) mode for this message
* **reactions**: The reactions to pay attention to and the role(s) they should grant
