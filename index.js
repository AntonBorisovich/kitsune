console.log("Starting...\n")

const Discord = require('discord.js');
Client = Discord.Client;
Intents = Discord.Intents;
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES ], partials: ["CHANNEL"]});
const fs = require("fs");
let config

let customvars = {}
fs.readdir("./values/", async (err, files)=>{
	let loaded = 0
    if (err) throw err;
	console.log('Loading vars...')
    await files.forEach((file)=>{
		let fileName = file.substring(0,file.length-5)
        let variable = require("./values/" + file)
		customvars[fileName] = variable[fileName]
		console.log(">var " + fileName + " = " + variable[fileName])
		loaded = (loaded + 1)
    })
	console.log(">>Loaded " + loaded + " vars\n")
	if (customvars.unstable || !customvars.stable) {
		console.log('Unstable bot mode\n')
		config = require('./testbotconfig.json');
	} else {
		console.log('Stable bot mode\n')
		config = require('./config.json');
	}
})

let commands = []
fs.readdir("./commands/", async (err, files)=>{
	console.log('Loading commands...')
	let loaded = 0
    if (err) throw err;
    await files.forEach((file)=>{
        let fileName = file.substring(0,file.length-3)
        let cmdPrototype = require("./commands/"+fileName)
        let command = new cmdPrototype(client, config, commands);
		commands.push(command)
		console.log(">Loaded "+command.name+" command")
		loaded = (loaded + 1)
    })
	console.log(">>Loaded " + loaded + " commands\n")
	setTimeout(() => {	
		console.log('Logging in Discord...')
		client.login(config.discordtoken);
	},2500);
})



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
	var result = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + hours + ":" + mins + ":" + seconds + " "
	return result
}

client.on("messageCreate", msg => {
	//console.log("zalupa")
	
	//some security
	if (config.maintenance && config.ownerID != msg.author.id || msg.author.bot) return
	
	let args = msg.content.split(" ")
	let executed = false
	if(args[0].toLowerCase().startsWith(config.prefix)){
		let cmd = args[0].substring(config.prefix.length)
		commands.forEach(command => {
			if(command.name == cmd.toLowerCase()){
				if (msg.guild) {
					const permissions = ['SEND_MESSAGES', 'EMBED_LINKS', ...command.perms];
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
				
				if (command.desc.endsWith('hide') && config.ownerID != msg.author.id) return
				
				try {
					if (msg.guild) {
						console.log(getTimestamp() + "[INFO] " + msg.author.tag + ' (' + msg.author.id + ') executed command ' + command.name + ' by sending message in channel #' + msg.channel.name + ' (' + msg.channel.id + ') in guild "' + msg.guild.name + '" (' + msg.guild.id + ')');
					} else {
						console.log(getTimestamp() + "[INFO] " + msg.author.tag + ' (' + msg.author.id + ') executed command ' + command.name + ' by sending message in channel #' + msg.channel.name + ' (' + msg.channel.id + ')');
					}
					msg.isCommand = false
					command.run(client, msg, args)
				} catch (error) {
					console.log(getTimestamp() + "[ERROR] " + "catched error while executing an command: \n" + String(error))
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("```\n" + String(error) + "\n```")
					msg.channel.send({ embeds: [embed] });
				}
			}
		});
	}
});

client.on('messageUpdate', (oldMessage, newMessage) => {
	//some security
	if (config.maintenance && config.ownerID != newMessage.author.id || newMessage.author.bot) return
	
	let args = newMessage.content.split(" ")
	if(args[0].toLowerCase().startsWith(config.prefix)){
		let cmd = args[0].substring(config.prefix.length)
		commands.forEach(command => {
			if(command.name == cmd.toLowerCase()){
				if (newMessage.guild) {
					const permissions = ['SEND_MESSAGES', 'EMBED_LINKS', ...command.perms];
					const missing = newMessage.channel.permissionsFor(newMessage.client.user).missing(permissions);
					if (!missing[0] == "") {
						console.log(getTimestamp() + "[ERROR] required permissions not found: " + missing.join(', ') + " in channel #" + newMessage.channel.name + " (" + newMessage.channel.id + ') in guild "' + newMessage.guild.name + '" (' + newMessage.guild.id + ')');
						if (!missing.includes("SEND_MESSAGES") && !missing.includes("EMBED_LINKS")) {
							let embed = new Discord.MessageEmbed()
							embed.setTitle(client.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Команда `" + command.name + "` не может работать без этих прав:\n```\n" + missing.join(', ') + "\n```\nПопросите владельца сервера предоставить это право " + client.user.username)
							newMessage.channel.send({ embeds: [embed] });
						} else if (!missing.includes("SEND_MESSAGES") && missing.includes("EMBED_LINKS")) {
							newMessage.channel.send({ content: "**" + client.user.username + " - Error**\n\nКоманда `" + command.name + "` не может работать без этих прав:\n```\n" + missing.join(', ') + "\n```\nПопросите владельца сервера предоставить это право " + client.user.username });
						}
						return;
					}
				}
				if (command.desc.endsWith('hide') && config.ownerID != newMessage.author.id) return
				try {
					if (newMessage.guild) {
						console.log(getTimestamp() + "[INFO] " + newMessage.author.tag + ' (' + newMessage.author.id + ') executed command ' + command.name + ' by editing message in channel #' + newMessage.channel.name + ' (' + newMessage.channel.id + ') in guild "' + newMessage.guild.name + '" (' + newMessage.guild.id + ')');
					} else {
						console.log(getTimestamp() + "[INFO] " + newMessage.author.tag + ' (' + newMessage.author.id + ') executed command ' + command.name + ' by editing message in channel #' + newMessage.channel.name + ' (' + newMessage.channel.id + ')');
					}
					newMessage.isCommand = false
					command.run(client, newMessage, args)
				} catch (error) {
					console.log(getTimestamp() + "[ERROR] " + "catched error while executing an command: \n" + String(error))
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("```\n" + String(error) + "\n```")
					newMessage.channel.send({ embeds: [embed] });
				}
			}
		});
	}
})				

client.on("interactionCreate", interaction => {
	if (interaction.isButton()) {
		commands.forEach(command => {
			if(interaction.customId.toLowerCase().startsWith(command.name)){
				try {
					if (msg.guild) {
						console.log(getTimestamp() + "[INFO] " + interaction.user.tag + ' (' + interaction.user.id + ') executed interaction ' + interaction.componentType + ' with custom id "' + interaction.customId + '" in message (' + interaction.message.id + ') in channel #' + interaction.channel.name + ' (' + interaction.channel.id + ') in guild "' + interaction.guild.name + '" (' + interaction.guild.id + ')');
					} else {
						console.log(getTimestamp() + "[INFO] " + interaction.user.tag + ' (' + interaction.user.id + ') executed interaction ' + interaction.componentType + ' with custom id "' + interaction.customId + '" in message (' + interaction.message.id + ') in channel #' + interaction.channel.name + ' (' + interaction.channel.id + ')');
					}
					
					command.buttonreply(client, interaction)
				} catch(err) {
					console.log(getTimestamp() + "[ERROR] " + "catched error while executing an interaction: \n" + String(err))
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("```\n" + String(err) + "\n```")
					interaction.channel.send({ embeds: [embed] });
				}
			}
		})
	}
	if (interaction.isCommand()) {
		commands.forEach(command => {
			if (command.name == interaction.commandName) {
				let hohol = interaction
				hohol.author = interaction.user
				hohol.isCommand = true
				if (typeof args !== 'undefined') {
					command.run(client, hohol, args)
				} else {
					command.run(client, hohol, "")
				}
			}
		})
		
	}
});

client.on("guildCreate", guild => {
	console.log(getTimestamp() + "[INFO] " + client.user.username + ' was joined to guild "' + guild.name + '" (' + guild.id + ')');
})

client.on("guildDelete", guild => {
	console.log(getTimestamp() + "[INFO] " + client.user.username + ' was kicked from guild "' + guild.name + '" (' + guild.id + ')');
})

client.once('ready', () => {
	if (config.maintenance) {
		client.user.setStatus('idle')
		client.user.setActivity('Тех. работы | tech. works');
		console.log(getTimestamp() + "[INFO] " + `${client.user.username} started in maintenance mode!`)
	} else {
		client.user.setStatus('online')
		client.user.setActivity(config.prefix + 'help');
		console.log(getTimestamp() + "[INFO] " + `${client.user.username} started!`)
	}
});

