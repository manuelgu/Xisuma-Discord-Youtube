### DEPRECATED
This branch is deprecated in favor of the `webhook implementation`.  This branch currently only exists for archival reasons and if someone really wants to integrate it in a bot.

# Xisumavoid YouTube notifications 
Discord notifier for YouTube channels.

### Installation
Copy `config.example.json` to `config.json`.  
Set up the variables in `config.json`
```js
{
	"google": "", // Your Google API key
	"bottoken": "", // Your Discord bottoken
	"owner": "", // Your Owner user (will be used to send errors to) E.G. MegaXLR#9729
	"ops": [""], // Your users who can drop the cache
	"cachetime": 5, // Cache time in minutes
	"channel": "", // Discord channel to send notifications in
	"prefix": "", // Command prefix.
	"channels": [""], // YouTube channel ID's to follow
	"colors": {
		// This is for the embed color. 
		// This is an object with the channel ID as key and the raw color as value
		// JSON doesnt suppport the 0x000000 notation, so you need to calculate it in decimal.
		// E.G. "UCU9pX8hKcrx06XfOB-VQLdw": 8944814 for Xisumavoid (https://discord.js.org/#/docs/main/stable/typedef/ColorResolvable)
	}
}
```

### Usage 
use the `youtube` command as an operator to reload the cache. 
Cache will be automatically refreshed after 5 minutes.
