# Xisumavoid YouTube notifications 
Discord notifier for YouTube channels.

### Installation
Copy `config.example.json` to `config.json`.  
Set up the variables in `config.json`
```js
{
	"google": "", // Your Google API key
	"cachetime": 5, // Cache time in minutes
	"channels": [""], // YouTube channel IDs to follow
	"colors": {
		// This is for the embed color. 
		// This is an object with the channel ID as key and the raw color as value
		// JSON doesnt suppport the 0x000000 notation, so you need to calculate it in decimal.
		// E.G. "UCU9pX8hKcrx06XfOB-VQLdw": 8944814 for Xisumavoid (https://discord.js.org/#/docs/main/stable/typedef/ColorResolvable)
	},
	"webhook":{
		"token": "", // The Webhook token (the long string after the last '/' in webhook settings)
		"id": "" // The webhook ID (the long string between 'wehooks/' and the next '/')
	}
}
```
