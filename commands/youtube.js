const config = require('../config.json');
const http = require('https');
const fs = require('fs');
const util = require('util');
module.exports = (function() {

	let cache = {};
	let discord;

	async function init(bot) {
		discord = bot;
		readcache();
		cache = fs.readFileSync('vidid.tmp', 'utf8');
		
		checkchannels();

		setInterval(() => {
			console.log('[YOUTUBE] Caching...');
			checkchannels();
			console.log(`[YOUTUBE] Scheduling cache in ${config.cachetime} minutes`);
		}, config.cachetime*60000);
	}

	async function checkchannels() {
		for (var i = config.channels.length - 1; i >= 0; i--) {
			checkvideo(config.channels[i]);
		}
	}

	async function checkvideo(channel) {
		console.log(`[YOUTUBE] checking: ${channel}`);
		let req = http.request({
			hostname: `www.googleapis.com`,
			port: 443,
			path: `/youtube/v3/search?part=snippet&channelId=${channel}&maxResults=1&order=date&type=video&key=${config.google}`,
			method: `GET`
			},
			(res) => {
			let str = "";
			res.on('data', function (chunk) {
				str += chunk;
			});
			res.on('end', function () {
				try {
					let video = JSON.parse(str).items[0];
					if(video.id.videoId != cache[channel]) {
						newVideo(video, channel);
						writecache(video.id.videoId, channel);
						console.log(`[YOUTUBE] Cached ${video.id.videoId} - ${video.snippet.title}`);
					} else {
						console.log(`[YOUTUBE] No new videos (${channel})`);
					}
				} catch(e) {
					discord.users.find(user => `${user.username}#${user.discriminator}` === config.owner).send(`\`\`\`js\n${util.inspect(e)}\n${str}${channel}\`\`\``);
				}	
			});
		});
		req.on('error', (e) => {
			discord.users.find(user => `${user.username}#${user.discriminator}` === config.owner).send(`\`\`\`js\n${util.inspect(e)}\`\`\``);
		});

		req.end();
	}

	async function newVideo(video,channel) {
		discord.channels.get(config.channel).send({
			embed :{
				color: config.colors[channel],
				title: video.snippet.title,
				image: video.snippet.thumbnails.high,
				url: `https://youtu.be/${video.id.videoId}`,
				footer: {
					text: "Xisumavoid Youtube Notifier"
				},
			}
		});
	}

	async function perform(message,args) {
		if(`${message.author.username}#${message.author.discriminator}` in config.ops || `${message.author.username}#${message.author.discriminator}` === config.owner) {
			message.reply('Force-reloading cache');
			checkchannels();
		} else {
			message.reply('```patch\n- Permission denied.```');
		}
	}

	async function readcache() {
		fs.readFile('vidid.tmp', 'utf8', function(err, contents) {
			if(err) fs.writeFileSync('vidid.tmp', {encoding: 'utf8'});
		    cache = JSON.parse(contents);
		});
	}

	async function writecache(data, channel) {
		cache[channel] = data;
		fs.writeFileSync('vidid.tmp', JSON.stringify(cache));
	}

	return {
		init: init,
		perform: perform,
	}

})();