# EmojiToRole
A discord.js bot that assigns roles based on reactions to a message.
## Features
This bot offers two different modes of operation:
1. mutually exclusive (disjoint)
1. independent
### Disjoint
* Makes sure that the member can only ever pick one of the choices presented
* Picking a different option nullifies the other
* Reactions get removed immediately  
*Example: choosing a team*
### Independent
* Members can pick as many choices as they like
* All roles are kept and reactions stay
* Removing the reaction causes the respective role(s) to be removed again  
*Example: selecting alert roles*
## Setup
The bot is exclusively configured through .json files.
### Token
Provide your token to the token.json file.
### Configuration
All messages to track and their respective settings go into the config.json file. Each message to track is provided as an object in an array. To track more messages simply add the following message Object to the config.json file:
```javascript
{
  "message": "446409003136712726",
  "channel": "414617785415630855",
  "disjoint": false,
  "reactions": [
    {
      "emoji": "🤔",
      "roles": [
        "446783613439311882"
      ]
    },
    {
      "emoji": "b26:441046394493599764",
      "roles": [
        "446783667084197910"
      ]
    }
  ]
}
```
**Message**: ID of the message to track  
**Channel**: ID of the channel the message is located in  
**disjoint**: Wether the bot runs in mutually exclusive (true) or independent (false) mode  
**Reactions**: The reactions to pay attention to and the role(s) they stand for  
