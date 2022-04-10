console.log(getTimestamp() + " [INFO] Initializing kitsune for Discord...");

const os = require('os');
console.log(getTimestamp() + ' [INFO] Running node ' + process.version + ' on ' + os.platform() + ' with ' + Math.floor((os.totalmem() / 1048576)) + 'MB of RAM');

// подключение модулей и установка переменных
const Discord = require('discord.js');
const kitsune = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGES ], partials: ["CHANNEL"]});
const fs = require("fs");
let values = {};
let funcs = {};
let commands = [];
let timeoutusers = [];

// чтений значений из папки src/values
fs.readdir("./src/values/", async (err, files)=>{
	let loaded = 0;
	let totalloaded = 0;
	let nowloading = "";
	if (err) throw err;
	console.log(getTimestamp() + ' [INFO] Reading values...')
	await files.forEach((file)=>{
		try {
			
			loaded = (loaded + 1);
			if (!file.endsWith(".json")) {
				console.log(" (" + loaded + "/" + files.length + ") Skipped value " + file + " (not .json)");
				return;
			};
			totalloaded = (totalloaded + 1)
			const fileName = file.substring(0,file.length-5);
			nowloading = fileName;
			const variable = require("./src/values/" + file);
			values[fileName] = variable[fileName];
			console.log(" (" + loaded + "/" + files.length + ") Loaded value " + fileName);
		} catch(err) {
			console.error(" (" + loaded + "/" + files.length + ") Error while loading value " + nowloading);
			console.error(err);
		};
	});
	console.log(getTimestamp() + " [INFO] Loaded " + totalloaded + " values");
	if (!values.prefix) {
		console.error(getTimestamp() + ' [ERROR] Prefix not found! Please create values/prefix.json and write in "{"prefix": "your_prefix"}"');
		process.exit(1);
	};
	if (!values.discordtoken) {
		console.error(getTimestamp() + ' [ERROR] Discord token not found! Can not log in discord. Please create values/discordtoken.json and write in "{"discordtoken": "your_token"}"');
		process.exit(1);
	};
	loadcomm();
})

async function loadcomm(){
	fs.readdir("./src/commands/", async (err, files)=>{
		console.log(getTimestamp() + ' [INFO] Reading commands...');
		let loaded = 0;
		let nowloading;
		if (err) throw err;
		await files.forEach((file)=>{
			try {
				loaded = (loaded + 1);
				let fileName = file.substring(0,file.length-3);
				nowloading = fileName;
				let cmdPrototype = require("./src/commands/"+fileName);
				let command = new cmdPrototype(kitsune, commands, values);
				commands.push(command);
				console.log(" (" + loaded + "/" + files.length + ") Loaded " + command.name + " command");
			} catch(err) {
				console.error(" (" + loaded + "/" + files.length + ") Error while loading command " + nowloading);
				console.error(err);
			}
		})
		console.log(getTimestamp() + " [INFO] Loaded " + loaded + " commands");
		console.log(getTimestamp() + ' [INFO] Logging in Discord...');
		kitsune.login(values.discordtoken);
	})
}

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

kitsune.on("messageCreate", async msg => {
	//some security
	if (values.maintenance && config.ownerID != msg.author.id || msg.author.bot) return
	//console.log(msg)
	let args = msg.content.split(" ")
	let executed = false
	if (args[0].toLowerCase().startsWith(values.prefix)) {
		let cmd = args[0].substring(values.prefix.length)
		commands.forEach(async command => {
			if (command.name == cmd.toLowerCase()) {
				let UserIsTimedOut = false
				for await (const user of timeoutusers) {
					if (user == msg.author.id) {
						UserIsTimedOut = true;
					}
				}
				if (!UserIsTimedOut) {
					timeoutusers.push(msg.author.id);
					setTimeout(() => {if (timeoutusers.indexOf(msg.author.id) !== -1) {timeoutusers.splice(timeoutusers.indexOf(msg.author.id), 1);};}, 3500);
				}
				if (UserIsTimedOut) return;
				
				if (msg.guild) {
					const permissions = ['SEND_MESSAGES', 'EMBED_LINKS', ...command.perms];
					const missing = msg.channel.permissionsFor(msg.client.user).missing(permissions);
					if (!missing[0] == "") {
						console.warn(getTimestamp() + " [ERROR] required permissions not found: " + missing.join(', ') + " in channel #" + msg.channel.name + " (" + msg.channel.id + ') in guild "' + msg.guild.name + '" (' + msg.guild.id + ')');
						if (!missing.includes("SEND_MESSAGES") && !missing.includes("EMBED_LINKS")) {
							let embed = new Discord.MessageEmbed()
							embed.setTitle(kitsune.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Команда `" + command.name + "` не может работать без этих прав:\n```\n" + missing.join(', ') + "\n```\nПопросите владельца сервера предоставить это право " + kitsune.user.username)
							msg.channel.send({ embeds: [embed] });
						} else if (!missing.includes("SEND_MESSAGES") && missing.includes("EMBED_LINKS")) {
							msg.channel.send({ content: "**" + kitsune.user.username + " - Error**\n\nКоманда `" + command.name + "` не может работать без этих прав:\n```\n" + missing.join(', ') + "\n```\nПопросите владельца сервера предоставить это право " + kitsune.user.username });
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
					command.run(kitsune, msg, args)
				} catch (error) {
					console.warn(getTimestamp() + " [ERROR] " + "catched error while executing an command: \n" + String(error))
					let embed = new Discord.MessageEmbed()
					embed.setTitle(kitsune.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("```\n" + String(error) + "\n```")
					msg.channel.send({ embeds: [embed] });
				}
			}
		});
	}
});

kitsune.on('messageUpdate', async (oldMessage, newMessage) => {
	//some security
	if (values.maintenance && config.ownerID != newMessage.author.id || newMessage.author.bot) return
	let args = newMessage.content.split(" ")
	if(args[0].toLowerCase().startsWith(values.prefix)){
		let cmd = args[0].substring(values.prefix.length)
		commands.forEach(async command => {
			if (command.name == cmd.toLowerCase()) {
				let UserIsTimedOut = false
				for await (const user of timeoutusers) {
					if (user == newMessage.author.id) {
						UserIsTimedOut = true;
					}
				}
				if (!UserIsTimedOut) {
					timeoutusers.push(newMessage.author.id)
					setTimeout(() => {if (timeoutusers.indexOf(newMessage.author.id) !== -1) {timeoutusers.splice(timeoutusers.indexOf(newMessage.author.id), 1);};}, 3500);
				}
				if (UserIsTimedOut) return;
				
				if (command.desc.endsWith('hide') && config.ownerID != newMessage.author.id) return
				if (newMessage.guild) {
					const permissions = ['SEND_MESSAGES', 'EMBED_LINKS', ...command.perms];
					const missing = newMessage.channel.permissionsFor(newMessage.client.user).missing(permissions);
					if (!missing[0] == "") {
						console.log(getTimestamp() + " [ERROR] required permissions not found: " + missing.join(', ') + " in channel #" + newMessage.channel.name + " (" + newMessage.channel.id + ') in guild "' + newMessage.guild.name + '" (' + newMessage.guild.id + ')');
						if (!missing.includes("SEND_MESSAGES") && !missing.includes("EMBED_LINKS")) {
							let embed = new Discord.MessageEmbed()
							embed.setTitle(kitsune.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Команда `" + command.name + "` не может работать без этих прав:\n```\n" + missing.join(', ') + "\n```\nПопросите владельца сервера предоставить это право " + kitsune.user.username)
							newMessage.channel.send({ embeds: [embed] });
						} else if (!missing.includes("SEND_MESSAGES") && missing.includes("EMBED_LINKS")) {
							newMessage.channel.send({ content: "**" + kitsune.user.username + " - Error**\n\nКоманда `" + command.name + "` не может работать без этих прав:\n```\n" + missing.join(', ') + "\n```\nПопросите владельца сервера предоставить это право " + kitsune.user.username });
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
					command.run(kitsune, newMessage, args)
				} catch (error) {
					console.warn(getTimestamp() + " [ERROR] " + "catched error while executing an command: \n" + String(error))
					let embed = new Discord.MessageEmbed()
					embed.setTitle(kitsune.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("```\n" + String(error) + "\n```")
					newMessage.channel.send({ embeds: [embed] });
				}
			}
		});
	}
})				

kitsune.on("interactionCreate", interaction => {
	try {
		if (values.maintenance && config.ownerID != interaction.user.id || interaction.user.bot) return
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
						command.buttonreply(kitsune, interaction)
					} catch(err) {
						console.warn(getTimestamp() + " [ERROR] catched error while executing an interaction: \n" + String(err))
						let embed = new Discord.MessageEmbed()
						embed.setTitle(kitsune.user.username + ' - Error')
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
						command.run(kitsune, hohol, args)
					} else {
						command.run(kitsune, hohol, "")
					}
				}
			})
		}

	} catch(err) {
		console.warn(getTimestamp() + " [ERROR] " + "catched error while executing an interaction: \n" + String(err))
		let embed = new Discord.MessageEmbed()
		embed.setTitle(kitsune.user.username + ' - Error')
		embed.setColor(`#F00000`)
		embed.setDescription("```\n" + String(err) + "\n```")
		interaction.channel.send({ embeds: [embed] });
	}
});

kitsune.on("guildCreate", guild => {
	console.log(getTimestamp() + " [INFO] " + kitsune.user.username + ' was joined to guild "' + guild.name + '" (' + guild.id + ')');
})

kitsune.on("guildDelete", guild => {
	console.log(getTimestamp() + " [INFO] " + kitsune.user.username + ' was kicked from guild "' + guild.name + '" (' + guild.id + ')');
})

kitsune.once('ready', () => {
	//kitsune.guilds.cache.size - TODO logging guilds count
	if (values.maintenance) {
		kitsune.user.setStatus('idle')
		kitsune.user.setActivity('Тех. работы | tech. works');
		console.log(getTimestamp() + " [INFO] " + `${kitsune.user.username} is ready to work in maintenance mode! In this mode, bot will reply only to users who have same id as in config (ownerID).`)
	} else {
		kitsune.user.setStatus('online')
		kitsune.user.setActivity(values.prefix + 'help');
		console.log(getTimestamp() + " [INFO] " + `${kitsune.user.username} is ready to work!`)
	}
});

