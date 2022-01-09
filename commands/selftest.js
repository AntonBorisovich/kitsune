const Discord = require("discord.js")

class Selftest {
    constructor(client, config, commands){
		this.test = "skip"; 
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "Utils";
		this.args = "<команда>";
		this.advargs = "<команда> - команда на проверку\nВведите \"vpn\" в <команды> для проверки команд, которым обязателен VPN\n\nБез аргументов будет произведен тест всех команд";
		this.usage = "<команда>";
        this.desc = "Самодиагностика hide";
        this.advdesc = "Самодиагностика компонентов бота";
        this.name = "selftest";
    }

    async run(client, msg, args){
		const ping = Math.round(client.ws.ping)
		if (msg.guild) {
			const permissions = ['SEND_MESSAGES', 'EMBED_LINKS'];
			const missing = msg.channel.permissionsFor(msg.client.user).missing(permissions);
			if (!missing[0] == "") {
				console.log(getTimestamp() + "[ERROR] required permissions not found: " + missing.join(', ') + " in channel #" + msg.channel.name + " (" + msg.channel.id + ') in guild "' + msg.guild.name + '" (' + msg.guild.id + ')');
				if (!missing.includes("SEND_MESSAGES") && !missing.includes("EMBED_LINKS")) {
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Команда `" + command.name + "` не может работать без этих прав:\n```\n" + missing.join(', ') + "\n```\nПопросите владельца сервера предоставить это право " + client.user.username)
					msg.channel.send({ embeds: [embed] });
				} else if (!missing.includes("SEND_MESSAGES") && missing.includes("EMBED_LINKS")) {
					msg.channel.send({ content: "**" + client.user.username + " - Error**\n\nКоманда `" + command.name + "` не может работать без этих прав:\n```\n" + missing.join(', ') + "\n```\nПопросите владельца сервера предоставить это право " + client.user.username });
				}
				return;
			}
		}
		let loger = "Discord connection - OK! (" + ping + " ms)\n"
        let embed = new Discord.MessageEmbed()
		embed.setTitle(client.user.username + ' - selftest')
		embed.setColor(`#F36B00`)
		embed.addField('log', '```\n' + loger + '```\n')
		const message = await msg.channel.send({ embeds: [embed] });
		
		async function edit(logg) {
			let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - selftest')
			embed.setColor(`#F36B00`)
			embed.addField('log', '```\n' + logg + '```\n')
			message.edit({ embeds: [embed] });
		}
		
		if (args[1]) {
			let returning = false
			for (const command of this.commands) {
				if (command.name.toLowerCase() == args[1].toLowerCase()) {
					if ( command.test == "skip" ){
						loger += command.name + " - OK\n"
					} else if ( !command.test ) {
						loger += command.name + " - test not found\n"
					} else if ( command.test ) {
						let templog = loger + command.name + " - testing...\n"
						edit(templog)
						let result = await command.testrun(message, "manual")
						loger += command.name + " - " + result + "\n"
						edit(loger)
					}
					loger += "\ndone"
					edit(loger)
					let returning = true
					return
				}
			}
			
			if (returning) {return}
				
			if (args[1].toLowerCase() == "vpn") {
				for (const command of this.commands) {
					if (command.vpn) {
						if ( command.test == "skip" ){
							loger += command.name + " - OK\n"
						} else if ( !command.test ) {
							loger += command.name + " - test not found\n"
						} else if ( command.test ) {
							let templog = loger + command.name + " - testing...\n"
							edit(templog)
							let result = await command.testrun(message, "manual")
							loger += command.name + " - " + result + "\n"
							edit(loger)
						}
					}	
				}
				loger += "\ndone"
				edit(loger)
				return
			}
		}
		
		for (const command of this.commands) {
			if ( command.test == "skip" ){
				loger += command.name + " - OK\n"
				//edit(loger)
			} else if ( !command.test ) {
				loger += command.name + " - test not found\n"
				//edit(loger)
			} else if ( command.test ) {
				let templog = loger + command.name + " - testing...\n"
				edit(templog)
				let result = await command.testrun(message, "manual")
				loger += command.name + " - " + result + "\n"
				edit(loger)
			}
		}
		loger += "\ndone"
		edit(loger)
    }
}
module.exports = Selftest

