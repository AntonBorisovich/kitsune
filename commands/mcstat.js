const Discord = require("discord.js")
const minecraft = require('minecraft-server-util');

class Mcstat {
    constructor(client, config, commands){
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "Utils";
		this.args = "<ip>";
		this.advargs = "<ip> - ip сервера. например: \n" +
					   "54.95.45.16 (порт по умолчанию - 25565)\n" +
					   "81.5.66.205:3001 (собственный порт через `:`)\n" +
					   "mc.hypixel.net (ссылка на сервер)";
		this.usage = "<ip>";
        this.desc = "статус minecraft сервера";
        this.advdesc = "Статус сервера minecraft java edition версии выше 1.7.2";
        this.name = "mcstat";
    }

    run(client, msg, args){
		
		if (!args[1]){
			let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Ты не указал ip")
			msg.channel.send({ embeds: [embed] });
			return
		}
		
		msg.channel.sendTyping()
		
		let mcport = 25565
		let mcip = args[1].split(':')
		
		if (mcip[1]) {
			mcport = mcip[1]
			mcip = mcip[0]
		} else {
			mcip = mcip[0]
		}
		
		minecraft.status(mcip, { timeout: 8000, port: Number(mcport)})
			.then((response) => {
				if (msg.guild) {
					const permissions = ['ATTACH_FILES'];
					const missing = msg.channel.permissionsFor(msg.client.user).missing(permissions);
					if (!missing[0] == "") {
						let embed = new Discord.MessageEmbed()
						embed.setTitle(client.user.username + ' - Minecraft Status')
						embed.setColor(`#F36B00`)
						embed.setDescription('**' + response.host + '**:' + response.port + '\n' + 
											'Версия: ' + response.version + '\n' +
											'Онлайн: ' + response.onlinePlayers + '/' + response.maxPlayers +
											'```\n' + response.motd.clean + '```')
				
						msg.channel.send({ embeds: [embed]});
					} else {
						const b64image = response.favicon.text
						const data = b64image.split(',')[1]; 
						const buf = new Buffer.from(data, 'base64');
						const file = new Discord.MessageAttachment(buf, 'icon.png');
						let embed = new Discord.MessageEmbed()
						embed.setThumbnail('attachment://icon.png')
						embed.setTitle(client.user.username + ' - Minecraft Status')
						embed.setColor(`#F36B00`)
						embed.setDescription('**' + response.host + '**:' + response.port + '\n' + 
											'Версия: ' + response.version + '\n' +
											'Онлайн: ' + response.onlinePlayers + '/' + response.maxPlayers +
											'```\n' + response.motd.clean + '```')
				
						msg.channel.send({ embeds: [embed], files: [file]});		
					}
				}
				
			})
			.catch((error) => {
				if (String(error).startsWith("undefined") || String(error).startsWith("Error: connect ECONNREFUSED")) {
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Сервер не найден")
					msg.channel.send({ embeds: [embed] });
					//console.log(error);3
					return;
				}
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("```\n" + error + "\n```")
				msg.channel.send({ embeds: [embed] });
				console.log(error);
			});
    }
}

module.exports = Mcstat

