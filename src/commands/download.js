const Discord = require("discord.js")
const fs = require('fs');
const ytdl = require('ytdl-core');
const path = require('path');

//cleaning temp

fs.readdir('./src/assets/download/temp/', (err, files) => {
  if (err) console.warn(err);
  for (const file of files) {
	if (file != ".gitkeep") {
		fs.unlink(path.join('./src/assets/download/temp/', file), err => {
		  if (err) console.warn(err);
		});
	}
  }
});

class Download {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "Fun";
		this.args = "<ссылка>"
		this.usage = "<ссылка>"
		this.advargs = "<ссылка> - ссылка на ролик YouTube"
        this.desc = "скачать видео";
        this.advdesc = "Скачать видео с YouTube";
        this.name = "download";
    }

    async run(client, msg, args){
		if (!args) {
			let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Укажите ссылку на видео YouTube для скачивания")
			msg.channel.send({ embeds: [embed] });
			return;
		}
		try {
			if (!ytdl.validateURL(args[1])) {
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Неверная ссылка. Укажите ссылку на видео YouTube для скачивания")
				msg.channel.send({ embeds: [embed] });
				return;
			}
			async function sizeError(audiovideo) {
				let downloadLinks = ""
				await audiovideo.forEach(format => {
					if (format.qualityLabel) {
						downloadLinks += "[" + format.qualityLabel + "](" + format.url + ") "
					}
				})
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - download')
				embed.setColor(`#F36B00`)
				embed.setDescription("Видео слишком большое и мы не можем его прикрепить через дискорд, но вы можете скачать его самостоятельно\n\n" + downloadLinks)
				msg.channel.send({ embeds: [embed]});
				return;
			}
			const info = await ytdl.getBasicInfo(args[1])
			const fullInfo = await ytdl.getInfo(args[1])
			const audiovideo = ytdl.filterFormats(fullInfo.formats, 'audioandvideo');
			if (audiovideo[0].approxDurationMs > 1000000) { sizeError(audiovideo); return; }
			const fileName = info.player_response.videoDetails.title + "." + info.player_response.videoDetails.videoId
			const sessionid = msg.id
			msg.channel.sendTyping()
			await ytdl(args[1], { filter: "audioandvideo" }).pipe(fs.createWriteStream('./src/assets/download/temp/' + sessionid + '.mp4').on('finish', () => {
				if (fs.statSync('./src/assets/download/temp/' + sessionid + '.mp4').size > 8388608) { sizeError(audiovideo); return; }
				msg.channel.send({files: [{attachment: './src/assets/download/temp/' + sessionid + '.mp4', name: fileName + '.mp4'}]});
				setTimeout(() => {fs.unlink(path.join('./src/assets/download/temp/', sessionid + '.mp4'), err => {if (err) console.warn(err);});}, 10000);
			}));
			return;
		} catch(err) {
			console.log(err)
			let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Произошла ошибка")
			embed.setFooter({ text: String(err)})
			msg.channel.send({ embeds: [embed] });
			return;
		}
    }
}

module.exports = Download

