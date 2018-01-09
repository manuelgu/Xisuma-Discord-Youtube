const Discord 	= require('discord.js'),
	config 		= require('./config.json');

let bot = new Discord.Client(),
	fs = require('fs'),
	modules;
console.log('[MAIN]    Connecting to Discord...')
bot.login(config.bottoken);

bot.on('ready', function() {
	console.log('[MAIN]    Logged on as ' + bot.user.tag);
	console.log('[MAIN]    Loading commands...');
	commandcache();
	bot.user.setPresence({game:{name:"Waiting for Xisuma to upload a video!"}});
});

let commandcache = function() {
	let mkcache = function() {
		let commands = [];
		fs.readdir('./commands/', function(err,files){
			if(err) throw err;
			files.forEach(function(file, index) {
				console.log('[MAIN]    Loaded command: ' + file.replace('.js', ''));
				commands[file.replace('.js', '')] = require('./commands/' + file);
				if(typeof commands[file.replace('.js', '')].init === "function") commands[file.replace('.js', '')].init(bot);
			});
		});
		return commandcache['commands'] = commands;
	}
	return this['commands'] != undefined ? this['commands'] : botcommands = mkcache(); 
}

bot.on('message', function(msg) {
	if(msg.author.bot || msg.author.id === bot.user.id) return;
	if(msg.content.startsWith(config.prefix) || msg.channel instanceof Discord.DMChannel) {
        const args = msg.channel instanceof Discord.DMChannel ? msg.content.trim().split(/ +/g) : msg.content.slice(config.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        if(command === "help") {
        	help(msg);
        	return;
        }
        if(typeof botcommands[command] != "undefined") {
            botcommands[command].perform(msg,args);
        } else if (typeof botcommands[command] === "undefined" && msg.channel instanceof Discord.DMChannel) {
        	msg.channel.send({embed:{
        		author: {
        			name: bot.user.username,
        			icon_url: bot.user.avatarURL,
        			url: "https://www.youtube.com/user/xisumavoid"
        		},
        		color: 0x006600,
        		title: "Error",
        		fields: [{
        			name:'Command not found',
        			value: `\`${command}\``,
        		}],
        	}})
        }
    }
})
async function help(msg) {
	let reply = {
		embed: {
			author: {
				name: bot.user.username,
				icon_url: bot.user.avatarURL,
				url: "https://www.youtube.com/user/xisumavoid"
			},
			color: 0x006600,
			title: "Help",
			fields: [],
		}
	}
	for (var key in botcommands) {
		reply.embed.fields.push({
			name: botcommands[key].help.title,
			value: '\u200B',
		});
		reply.embed.fields.push({
			name: 'Description',
			value: botcommands[key].help.description,
			inline: true,
		});
		reply.embed.fields.push({
			name: "Usage",
			value: "\`\`\`css\n" + botcommands[key].help.usage + "\`\`\`",
			inline: true,
		});
	}
	msg.channel.send(reply);
}

process.once('SIGUSR2', function () {
    console.log("[DISCORD] Disconnecting");
    bot.destroy();
    process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGTERM', (code) => {
    console.log("[DISCORD] Disconnecting");
    bot.destroy();
    process.exit();
});
