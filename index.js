const config 	= require('./config.json'),
	  http 		= require('https'),
	  fs 		= require('fs'),
	  util 		= require('util');

let cache;

async function main() {
	cache = await readcache();
	console.log("[MAIN]    Ready");
	checkchannels();
	setInterval(() => {
		checkchannels();
	}, config.cachetime * 60000);
}

async function checkchannels() {
	for (let i = config.channels.length - 1; i >= 0; i--) {
		checkvideo(config.channels[i]);
	}
}

async function checkvideo(channel) {
	const req = http.request({
		hostname: `www.googleapis.com`,
		port: 443,
		path: `/youtube/v3/search?part=snippet&channelId=${channel}&maxResults=1&order=date&type=video&key=${config.google}`,
		method: `GET`
	}, res => {
		let str = '';
		res.on('data', chunk => {
			str += chunk;
		});
		res.on('end', () => {
			try {
				const video = JSON.parse(str).items[0];
				if(video.id.videoId != cache[channel]) {
					announceVideo(video, channel);
					writecache(video.id.videoId, channel);
					console.log(`[YOUTUBE] Found ${video.id.videoId} - ${video.snippet.title}`);
				}
			} catch (e) {
				console.log(e, str);
			}
		});
	});
	req.on('error', e => {
		console.log(e);
	});
	req.end();
}

async function announceVideo(video,channel) {
	const data = {
		username: config.embed.username,
		avatar_url: config.embed.avatar,
		embeds: [
			{
				color: config.colors[channel],
				title: video.snippet.title,
				image: video.snippet.thumbnails.high,
				url: `https://youtu.be/${video.id.videoId}`,
				footer: {
					text: config.embed.footer
				}
			}
		]
	};

	const webhook = http.request({
		hostname: `canary.discordapp.com`,
		port: 443,
		path: `/api/webhooks/${config.webhook.id}/${config.webhook.token}`,
		method: 'POST',
		headers: {
			'User-Agent': config.useragent,
			'Content-Type': 'application/json',
			'Content-Length': Buffer.byteLength(JSON.stringify(data)),
		}
	});
	webhook.write(JSON.stringify(data));
	webhook.end();
}

async function readcache() {
	return new Promise(resolve => {
		fs.readFile('vidid.tmp', 'utf8', function(err, contents) {
			if(err) fs.writeFileSync('vidid.tmp', {encoding: 'utf8'}); // Clear on error or make if not exists.
	    	resolve(JSON.parse(contents));	    
		});
	})
}

async function writecache(data, channel) {
	cache[channel] = data;
	fs.writeFileSync('vidid.tmp', JSON.stringify(cache));
}

main();
