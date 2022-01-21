console.log(getTimestamp() + " [INFO] Initialization...")

const os = require('os');
const Discord = require('discord.js');
Client = Discord.Client;
Intents = Discord.Intents;
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES ], partials: ["CHANNEL"]});
const fs = require("fs");

console.log(getTimestamp() + ' [INFO] Running node ' + process.version + ' on ' + os.platform() + ' with ' + Math.floor((os.totalmem() / 1048576)) + 'MB of RAM')

let config
let customvars = {}
fs.readdir("./values/", async (err, files)=>{
	let loaded = 0
    if (err) throw err;
	console.log(getTimestamp() + ' [INFO] Loading vars...')
    await files.forEach((file)=>{
		loaded = (loaded + 1)
		let fileName = file.substring(0,file.length-5)
        let variable = require("./values/" + file)
		customvars[fileName] = variable[fileName]
		console.log(" (" + loaded + "/" + files.length + ") Loaded ver " + fileName + " = " + variable[fileName] + " (" + loaded + "/" + files.length + ")")
    })
	console.log(getTimestamp() + " [INFO] Loaded " + loaded + " vars")
	if (customvars.unstable || !customvars.stable) {
		config = require('./testbotconfig.json');
		console.log(getTimestamp() + ' [INFO] Loaded unstable bot config')
	} else {
		config = require('./config.json');
		console.log(getTimestamp() + ' [INFO] Loaded stable bot config')
	}
})
let commands = []
setTimeout(() => {	
	fs.readdir("./commands/", async (err, files)=>{
		console.log(getTimestamp() + ' [INFO] Loading commands...')
		let loaded = 0
		if (err) throw err;
		await files.forEach((file)=>{
			loaded = (loaded + 1)
			let fileName = file.substring(0,file.length-3)
			let cmdPrototype = require("./commands/"+fileName)
			let command = new cmdPrototype(client, config, commands, customvars);
			commands.push(command)
			console.log(" (" + loaded + "/" + files.length + ") Loaded " + command.name + " command")
		})
		console.log(getTimestamp() + " [INFO] Loaded " + loaded + " commands" )
		setTimeout(() => {	
			console.log(getTimestamp() + ' [INFO] Logging in Discord...')
			client.login(config.discordtoken);
		},2500);
	})
}, 1500);


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

client.on("messageCreate", msg => {
	//some security
	if (customvars.maintenance && config.ownerID != msg.author.id || msg.author.bot) return
	
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
						console.warn(getTimestamp() + " [ERROR] required permissions not found: " + missing.join(', ') + " in channel #" + msg.channel.name + " (" + msg.channel.id + ') in guild "' + msg.guild.name + '" (' + msg.guild.id + ')');
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
						console.log(getTimestamp() + " [INFO] " + msg.author.tag + ' (' + msg.author.id + ') executed command ' + command.name + ' by sending message in channel #' + msg.channel.name + ' (' + msg.channel.id + ') in guild "' + msg.guild.name + '" (' + msg.guild.id + ')');
					} else {
						console.log(getTimestamp() + " [INFO] " + msg.author.tag + ' (' + msg.author.id + ') executed command ' + command.name + ' by sending message in channel #' + msg.channel.name + ' (' + msg.channel.id + ')');
					}
					msg.isCommand = false
					command.run(client, msg, args)
				} catch (error) {
					console.warn(getTimestamp() + " [ERROR] " + "catched error while executing an command: \n" + String(error))
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
	if (customvars.maintenance && config.ownerID != newMessage.author.id || newMessage.author.bot) return
	
	let args = newMessage.content.split(" ")
	if(args[0].toLowerCase().startsWith(config.prefix)){
		let cmd = args[0].substring(config.prefix.length)
		commands.forEach(command => {
			if(command.name == cmd.toLowerCase()){
				if (command.desc.endsWith('hide') && config.ownerID != newMessage.author.id) return
				if (newMessage.guild) {
					const permissions = ['SEND_MESSAGES', 'EMBED_LINKS', ...command.perms];
					const missing = newMessage.channel.permissionsFor(newMessage.client.user).missing(permissions);
					if (!missing[0] == "") {
						console.log(getTimestamp() + " [ERROR] required permissions not found: " + missing.join(', ') + " in channel #" + newMessage.channel.name + " (" + newMessage.channel.id + ') in guild "' + newMessage.guild.name + '" (' + newMessage.guild.id + ')');
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
				try {
					if (newMessage.guild) {
						console.log(getTimestamp() + " [INFO] " + newMessage.author.tag + ' (' + newMessage.author.id + ') executed command ' + command.name + ' by editing message in channel #' + newMessage.channel.name + ' (' + newMessage.channel.id + ') in guild "' + newMessage.guild.name + '" (' + newMessage.guild.id + ')');
					} else {
						console.log(getTimestamp() + " [INFO] " + newMessage.author.tag + ' (' + newMessage.author.id + ') executed command ' + command.name + ' by editing message in channel #' + newMessage.channel.name + ' (' + newMessage.channel.id + ')');
					}
					newMessage.isCommand = false
					command.run(client, newMessage, args)
				} catch (error) {
					console.warn(getTimestamp() + " [ERROR] " + "catched error while executing an command: \n" + String(error))
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
	try {
		let executed = false
		if (interaction.type == "MESSAGE_COMPONENT") {
			executed = true
			commands.forEach(command => {
				if(interaction.customId.toLowerCase().startsWith(command.name)){
					try {
						if (interaction.guild) {
							console.log(getTimestamp() + " [INFO] " + interaction.user.tag + ' (' + interaction.user.id + ') executed interaction ' + interaction.componentType + ' with custom id "' + interaction.customId + '" in message (' + interaction.message.id + ') in channel #' + interaction.channel.name + ' (' + interaction.channel.id + ') in guild "' + interaction.guild.name + '" (' + interaction.guild.id + ')');
						} else {
							console.log(getTimestamp() + " [INFO] " + interaction.user.tag + ' (' + interaction.user.id + ') executed interaction ' + interaction.componentType + ' with custom id "' + interaction.customId + '" in message (' + interaction.message.id + ') in channel #' + interaction.channel.name + ' (' + interaction.channel.id + ')');
						}
						interaction.isCommand = false
						command.buttonreply(client, interaction)
					} catch(err) {
						console.warn(getTimestamp() + " [ERROR] catched error while executing an interaction: \n" + String(err))
						let embed = new Discord.MessageEmbed()
						embed.setTitle(client.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("```\n" + String(err) + "\n```")
						interaction.channel.send({ embeds: [embed] });
					}
				}
			})
		}
		if (interaction.type == "APPLICATION_COMMAND") {
			commands.forEach(command => {
				if (command.name == interaction.commandName) {
					let hohol = interaction
					hohol.author = interaction.user
					hohol.isCommand = true
					if (interaction.guild) {
						console.log(getTimestamp() + " [INFO] " + hohol.author.tag + ' (' + hohol.author.id + ') executed slash command ' + command.name + ' by editing message in channel #' + hohol.channel.name + ' (' + hohol.channel.id + ') in guild "' + hohol.guild.name + '" (' + hohol.guild.id + ')');
					} else {
						console.log(getTimestamp() + " [INFO] " + hohol.author.tag + ' (' + hohol.author.id + ') executed slash command ' + command.name + ' by editing message in channel #' + hohol.channel.name + ' (' + hohol.channel.id + ')');
					}
					if (typeof args !== 'undefined') {
						command.run(client, hohol, args)
					} else {
						command.run(client, hohol, "")
					}
				}
			})
		}

	} catch(err) {
		console.warn(getTimestamp() + " [ERROR] " + "catched error while executing an interaction: \n" + String(err))
		let embed = new Discord.MessageEmbed()
		embed.setTitle(client.user.username + ' - Error')
		embed.setColor(`#F00000`)
		embed.setDescription("```\n" + String(err) + "\n```")
		interaction.channel.send({ embeds: [embed] });
	}
});

client.on("guildCreate", guild => {
	console.log(getTimestamp() + " [INFO] " + client.user.username + ' was joined to guild "' + guild.name + '" (' + guild.id + ')');
})

client.on("guildDelete", guild => {
	console.log(getTimestamp() + " [INFO] " + client.user.username + ' was kicked from guild "' + guild.name + '" (' + guild.id + ')');
})

client.once('ready', () => {
	//client.guilds.cache.size - TODO logging guilds count
	if (customvars.maintenance) {
		client.user.setStatus('idle')
		client.user.setActivity('Тех. работы | tech. works');
		console.log(getTimestamp() + " [INFO] " + `${client.user.username} (${config.version}) is ready to work in maintenance mode! In this mode, bot will reply only to users who have same id as in config (ownerID).`)
	} else {
		client.user.setStatus('online')
		client.user.setActivity(config.prefix + 'help');
		console.log(getTimestamp() + " [INFO] " + `${client.user.username} (${config.version}) is ready to work!`)
	}
});

