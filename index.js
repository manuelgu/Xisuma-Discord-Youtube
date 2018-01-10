const config = require('./config.json');
const http = require('https');
const fs = require('fs');
const util = require('util');

async function init() {
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
				console.log(e,str);
			}	
		});
	});
	req.on('error', (e) => {
		console.log(e);
	});

	req.end();
}

async function newVideo(video,channel) {
	let data = {
		username: 'Xisuma on Youtube',
		avatar_url: 'https://yt3.ggpht.com/-x5tq4dTokyM/AAAAAAAAAAI/AAAAAAAAAAA/x4s30KOqUVA/s900-c-k-no/photo.jpg',
		embeds: [
			{
				color: config.colors[channel],
				title: video.snippet.title,
				image: video.snippet.thumbnails.high,
				url: `https://youtu.be/${video.id.videoId}`,
				footer: {
					text: "Xisumavoid Youtube Notifier"
				}
			}
		]
	}

	let webhook = http.request({
		hostname: 'canary.discordapp.com',
		port: 443,
		path: '/api/webhooks/${config.webhook.channel}/${config.webook.token}',
		method: 'POST',
		headers: {
			'User-Agent': 'Xisuma-Discord-YouTube (xisumavoid.com, 1.0.0)',
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(JSON.stringify(data)),
		},
	}, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
		      console.log("body: " + chunk);
		  });
	});
	webhook.write(JSON.stringify(data));
	webhook.end();
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

init();
