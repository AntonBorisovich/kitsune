const Discord = require("discord.js")
const minecraft = require('minecraft-server-util');

class Mcstat {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
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
        this.advdesc = "Статус сервера Minecraft Java Edition версии 1.7.2 и выше";
        this.name = "mcstat";
    }

    async run(client, msg, args){
		
		if (!args[1]){
			let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Ты не указал ip")
			msg.channel.send({ embeds: [embed] });
			return
		}
			
		//msg.channel.sendTyping()
		
		let mcport = 25565
		let mcip = args[1].split(':')
		
		if (mcip[1]) {
			mcport = mcip[1]
			mcip = mcip[0]
		} else {
			mcip = mcip[0]
		}
		
		let embed = new Discord.MessageEmbed()
		embed.setTitle(client.user.username + ' - Minecraft Status')
		embed.setColor(`#F36B00`)
		embed.setDescription("Подключение к серверу...")
		const message = await msg.channel.send({ embeds: [embed] });
		minecraft.status(mcip, Number(mcport), { timeout: 10000 })
		.then((response) => {
			let players = []
			if (response.players.sample) {
				if (response.players.sample.length >= 1) {
					response.players.sample.forEach(sample => {
						players += sample.name + "\n"
					})
				}
			}
			if (msg.guild) {
				const permissions = ['ATTACH_FILES'];
				const missing = msg.channel.permissionsFor(msg.client.user).missing(permissions);
							
				if (!missing[0] == "") {
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - Minecraft Status')
					embed.setColor(`#F36B00`)
					if (response.players.sample) {
						if (response.players.sample.length >= 1) {
							embed.setDescription('**' + mcip + '**:' + Number(mcport) + '\n' + 
										'Версия: ' + response.version.name + '\n' +
										'Онлайн: ' + response.players.online + '/' + response.players.max + "\n" +
										'Игроки:\n```\n' + players + '\n```\n' +
										'Motd:```\n' + response.motd.clean + '```\n')
						} else {
							embed.setDescription('**' + mcip + '**:' + Number(mcport) + '\n' + 
										'Версия: ' + response.version.name + '\n' +
										'Онлайн: ' + response.players.online + '/' + response.players.max +
										'```\n' + response.motd.clean + '```')
						}
					} else {
						embed.setDescription('**' + mcip + '**:' + Number(mcport) + '\n' + 
									'Версия: ' + response.version.name + '\n' +
									'Онлайн: ' + response.players.online + '/' + response.players.max +
									'```\n' + response.motd.clean + '```')
					}
					message.edit({ embeds: [embed] });
				} else {
					const b64image = response.favicon
					const data = b64image.split(',')[1]; 
					const buf = new Buffer.from(data, 'base64');
					const file = new Discord.MessageAttachment(buf, 'icon.png');
					let embed = new Discord.MessageEmbed()
					embed.setThumbnail('attachment://icon.png')
					embed.setTitle(client.user.username + ' - Minecraft Status')
					embed.setColor(`#F36B00`)
					if (response.players.sample) {
						if (response.players.sample.length >= 1) {
							embed.setDescription('**' + mcip + '**:' + Number(mcport) + '\n' + 
										'Версия: ' + response.version.name + '\n' +
										'Онлайн: ' + response.players.online + '/' + response.players.max + "\n" +
										'Игроки:\n```\n' + players + '\n```\n' +
										'Motd:```\n' + response.motd.clean + '```\n')
						} else {
							embed.setDescription('**' + mcip + '**:' + Number(mcport) + '\n' + 
										'Версия: ' + response.version.name + '\n' +
										'Онлайн: ' + response.players.online + '/' + response.players.max +
										'```\n' + response.motd.clean + '```')
						}
					} else {
						embed.setDescription('**' + mcip + '**:' + Number(mcport) + '\n' + 
									'Версия: ' + response.version.name + '\n' +
									'Онлайн: ' + response.players.online + '/' + response.players.max +
									'```\n' + response.motd.clean + '```')
					}
					message.edit({ embeds: [embed], files: [file]});		
				}
			}	
		})
		.catch((error) => {
			if (String(error).startsWith("undefined") || String(error).startsWith("Error: connect ECONNREFUSED")) {
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Невозможно установить подключение")
				embed.setFooter({text: String(error)})
				message.edit({ embeds: [embed] });
				//console.log(error);
				return;
			} else if (String(error).startsWith("Error: Timed out")) {
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Превышено время ожидания")
				embed.setFooter({text: String(error)})
				message.edit({ embeds: [embed] });
				//console.log(error);
				return;
			} else {
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Неизвестная ошибка")
				embed.setFooter({text: String(error)})
				message.edit({ embeds: [embed] });
				//console.log(error);
				return;
			}
		});
	}
}

module.exports = Mcstat

