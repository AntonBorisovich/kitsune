const Discord = require("discord.js")
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

class Updateslashcom {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "Utils";
		this.args = "<команда>";
		this.advargs = "<команда> - команда для добавления в слэш-команды\n" +
					   "Так же есть аргумент <-g> для принудительного изменения глобальных значений";
		this.usage = "<команда>";
        this.desc = "обновить слэш-команды hide";
        this.advdesc = "Обновление слэш-команд";
        this.name = "updslashcom";
    }

    async run(client, msg, args){
        
		let commands
		let globalcomm = false
		args.forEach(arg => {
			if (arg.toLowerCase() == "-g") {
				let i = args.indexOf('-g');
				if(i >= 0) {
				   args.splice(i,1);
				}
				globalcomm = true
			}
		})
		let embed = new Discord.MessageEmbed()
		embed.setTitle(client.user.username + ' - Slash Command Update')
		embed.setColor(`#F36B00`)
		if (globalcomm) {
			embed.setDescription("Получение данных о глобальных слэш-командах...")
		} else {
			embed.setDescription("Получение данных о слэш-командах сервера...")
		}
		const message = await msg.channel.send({ embeds: [embed] });	
		if (msg.guild && !globalcomm) {
			console.log('guild comms')
			commands = msg.guild.commands
		} else {
			console.log('global comms')
			commands = client.application.commands
		}		
		if (args[1]) {
			for (const command of this.commands) {
				if (args[1].toLowerCase() == command.name) {
					if (args[2]) {
						if (args[2].toLowerCase() == "-d") {
							commands.fetch().then(comms => comms.map(comm => { if (comm.name == command.name) {
								commands.delete(comm.permissions.commandId)
								embed = new Discord.MessageEmbed()
								embed.setTitle(client.user.username + ' - Slash Command Update')
								embed.setColor(`#F36B00`)
								if (!globalcomm) {
									embed.setDescription('Слеш-команда "' + command.name + '" удалена с сервера')
								} else {
									embed.setDescription('Глобальная слеш-команда "' + command.name + '" удалена')
								}
								
								message.edit({ embeds: [embed] });
							}}))
						} else if (args[2].toLowerCase() == "-u") {
							commands.fetch().then(comms => comms.map(comm => { if (comm.name == command.name) {
								comm.edit({
									description: command.desc
								})
								embed = new Discord.MessageEmbed()
								embed.setTitle(client.user.username + ' - Slash Command Update')
								embed.setColor(`#F36B00`)
								if (!globalcomm) {
									embed.setDescription('Описание слэш-команды "' + command.name + '" на этом сервере обновлено')
								} else {
									embed.setDescription('Описание глобальной слэш-команды "' + command.name + '" обновлено')
								}
								
								message.edit({ embeds: [embed] });
							}}))
						}
					} else {
						commands.create({
							name: command.name,
							description: command.desc
						})
						embed = new Discord.MessageEmbed()
						embed.setTitle(client.user.username + ' - Slash Command Update')
						embed.setColor(`#F36B00`)
						if (!globalcomm) {
							embed.setDescription('Команда "' + command.name + '" добавлена как слэш-команда на сервере "' + message.guild.name + '"')
						} else {
							embed.setDescription('Команда "' + command.name + '" добавлена как глобальная слэш-команда')
						}
						message.edit({ embeds: [embed] });
					}
				} else if (args[1].toLowerCase() == "-u") {
					commands.fetch().then(comms => comms.map(comm => { if (comm.name == command.name) {
						comm.edit({
							description: command.desc
						})
					}})).then(() => {
						embed = new Discord.MessageEmbed()
						embed.setTitle(client.user.username + ' - Slash Command Update')
						embed.setColor(`#F36B00`)
						if (!globalcomm) {
							embed.setDescription('Описание всех слэш-команд на этом сервере обновлено')
						} else {
							embed.setDescription('Описание всех глобальных слэш-команд обновлено')
						}
						message.edit({ embeds: [embed] });
					})
				} else if (args[1].toLowerCase() == "-d") {
					commands.fetch().then(comms => comms.map(comm => { if (comm.name == command.name) {
						comm.delete()
					}})).then(() => {
						embed = new Discord.MessageEmbed()
						embed.setTitle(client.user.username + ' - Slash Command Update')
						embed.setColor(`#F36B00`)
						if (!globalcomm) {
							embed.setDescription('Все слэш-команды на этом сервере удалены')
						} else {
							embed.setDescription('Все глобальные слэш-команды были удалены (ну и зачем ты это сделал?)')
						}
						message.edit({ embeds: [embed] });
					})
				}
			}	
		} else {
			let slashcommands = ""
			await commands.fetch().then(comms => comms.map(comm => {slashcommands += `/${comm.name} (${comm.id})\n`}))
			embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - Slash Command Update')
			embed.setColor(`#F36B00`)
			let listtext
			if (!globalcomm) {
				listtext = 'Список слэш-команд на этом сервере'
			} else {
				listtext = 'Список глобальных слэш-команд'
			}
			if (!slashcommands) {
				slashcommands = "Никаких слэш-команд не найдено"
			}
			embed.setDescription(listtext + "\n```\n" + slashcommands + "\n```")
			message.edit({ embeds: [embed] });
		}
    }
}

module.exports = Updateslashcom

