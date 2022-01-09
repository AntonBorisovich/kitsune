const Discord = require("discord.js")
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

class Updateslashcom {
    constructor(client, config, commands){
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "Utils";
		this.args = "<команда>";
		this.advargs = "<команда> - команда для добавления в слэш-команды";
		this.usage = "<команда>";
        this.desc = "обновить слэш-команды hide";
        this.advdesc = "Обновление слэш-команд";
        this.name = "updslashcom";
    }

    async run(client, msg, args){
        let embed = new Discord.MessageEmbed()
		embed.setTitle(client.user.username + ' - Slash Command Update')
		embed.setColor(`#F36B00`)
		embed.setDescription("Loading...")
		const message = await msg.channel.send({ embeds: [embed] });	
		let commands
		let globalcomm = false
		if (globalcomm) {
			console.log('global comms')
			commands = client.application.commands
		} else if (msg.guild) {
			console.log('guild comms')
			commands = msg.guild.commands
		}		
		if (args[1]) {
			for (const command of this.commands) {
				if (command.name == args[1].toLowerCase()) {
					if (args[2]) {
						if (args[2].toLowerCase() == "-d") {
							//var commid = ""
							console.log('added ' + command.name)
							commands.fetch().then(comms => comms.map(comm => { if (comm.name == command.name) {
								commands.delete(comm.permissions.commandId)
								console.log("deleted " + comm.permissions.commandId)
							}}))
						}			
					} else {
						let slashcommands = ""
						console.log('added ' + command.name)
						commands.fetch().then(comms => slashcommands = comms.map(comm => `${comm.name} (${comm.id})\n`).join(""))
						console.log(slashcommands)
						commands.create({
							name: command.name,
							description: command.desc
						})
					}
				}
			}	
		} else {
			let slashcommands = ""
			await commands.fetch().then(comms => comms.map(comm => {slashcommands += `${comm.name} (${comm.id})\n`}))
			console.log(slashcommands)
		}
    }
}

module.exports = Updateslashcom

