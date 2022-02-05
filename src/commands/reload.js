const Discord = require("discord.js")
const fs = require("fs");

class Reload {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "Utils";
		this.args = "<модуль>"
		this.usage = "<модуль>"
		this.advargs = "<модуль> - команда или значение, которое вы хотите переназначить. Вы также можете использовать аргумент `all` для перезапуска всех модулей или аргументы `all comms` или `all vars` для перезапуска всех команд или значений соответственно"
        this.desc = "перезагрузить модуль hide";
        this.advdesc = "Перезагрузить модуль бота (команду или значение). Не рекомендуется менять значения таким способом без последующего перезапуска всего бота";
        this.name = "reload";
    }

    async run(client, msg, args){
		function getTimestamp() {
			var date = new Date();
			var hours = date.getHours()
			if (hours < 10) {
				hours = "0" + hours
			}
			var mins = date.getMinutes()
			if (mins < 10) {
				mins = "0" + mins
			}
			var seconds = date.getSeconds()
			if (seconds < 10) {
				seconds = "0" + seconds
			}
			var result = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + hours + ":" + mins + ":" + seconds
			return result
		}
		
		if (!args) {
			let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Нету аргументов")
			msg.channel.send({ embeds: [embed] });
			return;
		}
		
		let embed = new Discord.MessageEmbed()
		embed.setTitle(client.user.username + ' - reload')
		embed.setColor(`#F36B00`)
		embed.setDescription("Подождите...")
		const message = await msg.channel.send({ embeds: [embed] });
		
		if (args[1].toLowerCase() == "all") {
			if (args[2]) {
				if (args[2] == "comms") {
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - reload')
					embed.setColor(`#F36B00`)
					embed.setDescription("бля доделай это сначало (логирование перезапускаемых команд)")
					message.edit({ embeds: [embed] });
					return;
					fs.readdir("./src/commands/", async (err, files)=>{
						console.log(getTimestamp() + ' [INFO] Reloading commands...')
						this.commands.length = 0
						let loaded = 0
						let nowloading
						if (err) throw err;
						await files.forEach((file)=>{
							try {
								loaded = (loaded + 1)
								let fileName = file.substring(0,file.length-3)
								nowloading = fileName
								let cmdPrototype = require("./" + fileName)
								let command = new cmdPrototype(client, this.config, this.commands, this.customvars);
								this.commands.push(command)
								console.log(" (" + loaded + "/" + files.length + ") Loaded " + command.name + " command")
							} catch(err) {
								console.error(" (" + loaded + "/" + files.length + ") Error while loading command " + nowloading)
								console.error(err)
							}
						})
						console.log(getTimestamp() + " [INFO] Loaded " + loaded + " commands" )
					})
				} else if (args[2] == "vars") {
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - reload')
					embed.setColor(`#F36B00`)
					embed.setDescription("бля доделай это сначало (перезагрузка всех значений)")
					message.edit({ embeds: [embed] });
				} else {
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - reload')
					embed.setColor(`#F36B00`)
					embed.setDescription("бля доделай это сначало (перезагрузка конкретной команды)")
					message.edit({ embeds: [embed] });
				}
			} else {
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - reload')
				embed.setColor(`#F36B00`)
				embed.setDescription("Чумба, ты совсем ёбнутый? Сходи к reboot, попей reboot -q")
				message.edit({ embeds: [embed] });
			}	
		}
    }
}

module.exports = Reload

