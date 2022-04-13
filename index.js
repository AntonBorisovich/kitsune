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
let init1_complete = 0;
init_step1();

// чтений значений из папки src/values и функций из папки src/functions
async function init_step1(){
	await fs.readdir("./src/values/", async (err, files)=>{
		console.log(getTimestamp() + ' [INFO] Initializing values...');
		let loaded = 0;
		let totalloaded = 0;
		let nowloading = "";
		if (err) throw err;
		await files.forEach((file)=>{
			try {
				loaded = (loaded + 1);
				if (!file.endsWith(".json")) {
					console.log(" (" + loaded + "/" + files.length + ") Skipped value " + file + " (not .json)");
					return;
				};
				totalloaded = (totalloaded + 1);
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
		init1_complete = init1_complete + 1;
		init_step2(); // переходим к дальнейшей инициализации
	});
	await fs.readdir("./src/functions/", async (err, files)=>{
		console.log(getTimestamp() + ' [INFO] Initializing functions...');
		let loaded = 0;
		let nowloading;
		if (err) throw err;
		await files.forEach((file)=>{
			try {
				loaded = (loaded + 1);
				let fileName = file.substring(0,file.length-3);
				nowloading = fileName;
				let funky = require("./src/commands/"+fileName);
				let func = new funky(kitsune, values);
				funcs.push(func);
				console.log(" (" + loaded + "/" + files.length + ") Loaded " + command.name + " function");
			} catch(err) {
				console.error(" (" + loaded + "/" + files.length + ") Error while loading function " + nowloading);
				console.error(err);
			};
		});
		console.log(getTimestamp() + " [INFO] Loaded " + totalloaded + " functions");
		if (!funcs.error) {
			console.error(getTimestamp() + ' [ERROR] Error logging function not found!');
			process.exit(1);
		};
		init1_complete = init1_complete + 1;
		init_step2(); // переходим к дальнейшей инициализации
	});
};

// чтение команд из папки src/commands
async function init_step2(){
	if (init1_complete != 2) return;
	fs.readdir("./src/commands/", async (err, files)=>{
		console.log(getTimestamp() + ' [INFO] Initializing commands...');
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
			};
		});
		console.log(getTimestamp() + " [INFO] Loaded " + loaded + " commands");
		console.log(getTimestamp() + ' [INFO] Logging in Discord...');
		kitsune.login(values.discordtoken);
	});
};

// функция логирования времени
function getTimestamp() {
	var date = new Date();
	var hours = date.getHours();
	if (hours < 10) {
		hours = "0" + hours;
	};
	var mins = date.getMinutes();
	if (mins < 10) {
		mins = "0" + mins;
	};
	var seconds = date.getSeconds();
	if (seconds < 10) {
		seconds = "0" + seconds;
	};
	var result = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + hours + ":" + mins + ":" + seconds;
	return result;
};

// обработка получения нового сообщения
kitsune.on("messageCreate", async msg => {
	if (values.maintenance && values.developers[0] != msg.author.id || msg.author.bot) return; // игнор бота и игнор всех в режиме обслуживания
	let args = msg.content.split(" ");
	if (args[0].toLowerCase().startsWith(values.prefix)) { // если сообщение начинается с префикса то работать
		let cmd = args[0].substring(values.prefix.length) // получаем имя вызываемой команды из сообщения
		commands.forEach(async command => { // перебираем список команд в боте
			if (command.name == cmd.toLowerCase()) { // если команда в сообщении совпала с командой из списка бота то работать		
				if (msg.guild) { // если вызвано на сервере то проверить права
					const permissions = ['SEND_MESSAGES', 'EMBED_LINKS', ...command.perms];
					const missing = msg.channel.permissionsFor(msg.client.user).missing(permissions);
					if (!missing[0] == "") {
						console.warn(getTimestamp() + " [ERROR] required permissions not found: " + missing.join(', ') + " in channel #" + msg.channel.name + " (" + msg.channel.id + ') in guild "' + msg.guild.name + '" (' + msg.guild.id + ')');
						if (!missing.includes("SEND_MESSAGES") && !missing.includes("EMBED_LINKS")) {
							let embed = new Discord.MessageEmbed()
							embed.setTitle(kitsune.user.username + ' - Error');
							embed.setColor(`#F00000`);
							embed.setDescription("Команда `" + command.name + "` не может работать без этих прав:\n```\n" + missing.join(', ') + "\n```\nПопросите владельца сервера предоставить это право " + kitsune.user.username);
							msg.channel.send({ embeds: [embed] });
						} else if (!missing.includes("SEND_MESSAGES") && missing.includes("EMBED_LINKS")) {
							msg.channel.send({ content: "**" + kitsune.user.username + " - Error**\n\nКоманда `" + command.name + "` не может работать без этих прав:\n```\n" + missing.join(', ') + "\n```\nПопросите владельца сервера предоставить это право " + kitsune.user.username });
						};
						return;
					};
				};
				
				try {
					if (msg.guild) { // если на сервере то логировать название сервера
						console.log(getTimestamp() + " [INFO] " + msg.author.tag + ' (' + msg.author.id + ') executed command ' + command.name + ' by sending message in channel #' + msg.channel.name + ' (' + msg.channel.id + ') in guild "' + msg.guild.name + '" (' + msg.guild.id + ')');
					} else { // иначе логировать без сервера
						console.log(getTimestamp() + " [INFO] " + msg.author.tag + ' (' + msg.author.id + ') executed command ' + command.name + ' by sending message in channel #' + msg.channel.name + ' (' + msg.channel.id + ')');
					}
					async command.run(kitsune, msg, args); // запуск команды
				} catch (error) { // если ошибка то логировать ошибку
					funcs.error(error);
				};
			};
		});
	};
});

// обработка получения изменённого сообщения
kitsune.on('messageUpdate', async (oldMsg, msg) => {
	if (values.maintenance && values.developers[0] != msg.author.id || msg.author.bot) return; // игнор бота и игнор всех в режиме обслуживания
	let args = msg.content.split(" ");
	if (args[0].toLowerCase().startsWith(values.prefix)) { // если сообщение начинается с префикса то работать
		let cmd = args[0].substring(values.prefix.length); // получаем имя вызываемой команды из сообщения
		commands.forEach(async command => { // перебираем список команд в боте
			if (command.name == cmd.toLowerCase()) { // если команда в сообщении совпала с командой из списка бота то работать		
				if (msg.guild) { // если вызвано на сервере то проверить права
					const permissions = ['SEND_MESSAGES', 'EMBED_LINKS', ...command.perms];
					const missing = msg.channel.permissionsFor(msg.client.user).missing(permissions);
					if (!missing[0] == "") {
						console.warn(getTimestamp() + " [ERROR] required permissions not found: " + missing.join(', ') + " in channel #" + msg.channel.name + " (" + msg.channel.id + ') in guild "' + msg.guild.name + '" (' + msg.guild.id + ')');
						if (!missing.includes("SEND_MESSAGES") && !missing.includes("EMBED_LINKS")) {
							let embed = new Discord.MessageEmbed()
							embed.setTitle(kitsune.user.username + ' - Error');
							embed.setColor(`#F00000`);
							embed.setDescription("Команда `" + command.name + "` не может работать без этих прав:\n```\n" + missing.join(', ') + "\n```\nПопросите владельца сервера предоставить это право " + kitsune.user.username);
							msg.channel.send({ embeds: [embed] });
						} else if (!missing.includes("SEND_MESSAGES") && missing.includes("EMBED_LINKS")) {
							msg.channel.send({ content: "**" + kitsune.user.username + " - Error**\n\nКоманда `" + command.name + "` не может работать без этих прав:\n```\n" + missing.join(', ') + "\n```\nПопросите владельца сервера предоставить это право " + kitsune.user.username });
						};
						return;
					};
				};
				
				try {
					if (msg.guild) { // если на сервере то логировать название сервера
						console.log(getTimestamp() + " [INFO] " + msg.author.tag + ' (' + msg.author.id + ') executed command ' + command.name + ' by editing message in channel #' + msg.channel.name + ' (' + msg.channel.id + ') in guild "' + msg.guild.name + '" (' + msg.guild.id + ')');
					} else { // иначе логировать без сервера
						console.log(getTimestamp() + " [INFO] " + msg.author.tag + ' (' + msg.author.id + ') executed command ' + command.name + ' by editing message in channel #' + msg.channel.name + ' (' + msg.channel.id + ')');
					}
					async command.run(kitsune, msg, args); // запуск команды
				} catch (error) { // если ошибка то логировать ошибку
					funcs.error(error);
				};
			};
		});
	};
});

// обработка интерактивного элемента (кнопки, слэш-команды)
kitsune.on("interactionCreate", interaction => {
	if (values.maintenance && values.developers[0] != interaction.user.id || interaction.user.bot) return; // игнор бота и игнор всех в режиме обслуживания
	try {
		if (interaction.type == "MESSAGE_COMPONENT") { // обработка кнопки
			commands.forEach(command => { // перебираем список команд в боте
				if(interaction.customId.toLowerCase().startsWith(command.name)){ // если id содержит имя команды то работать
					try {
						if (interaction.guild) { // если выполнено на сервере то логировать имя сервере
							console.log(getTimestamp() + " [INFO] " + interaction.user.tag + ' (' + interaction.user.id + ') executed interaction ' + interaction.componentType + ' with custom id "' + interaction.customId + '" in message (' + interaction.message.id + ') in channel #' + interaction.channel.name + ' (' + interaction.channel.id + ') in guild "' + interaction.guild.name + '" (' + interaction.guild.id + ')');
						} else { // иначе логировать без имени сервера
							console.log(getTimestamp() + " [INFO] " + interaction.user.tag + ' (' + interaction.user.id + ') executed interaction ' + interaction.componentType + ' with custom id "' + interaction.customId + '" in message (' + interaction.message.id + ') in channel #' + interaction.channel.name + ' (' + interaction.channel.id + ')');
						};
						command.buttonreply(kitsune, interaction); // работать
					} catch(error) { // если шашипка то логировать её
						funcs.error(error);
					};
				};
			});
		};
		if (interaction.type == "APPLICATION_COMMAND") { // обработка слэш-команды
			commands.forEach(command => { // перебираем список команд в боте
				if (command.name == interaction.commandName) { // если команда в сообщении является командой в списке бота то работать
					let args // ДОДЕЛАТЬ
					if (interaction.guild) { // если сервер то логировать сервер
						console.log(getTimestamp() + " [INFO] " + hohol.author.tag + ' (' + hohol.author.id + ') executed slash command ' + command.name + ' by editing message in channel #' + hohol.channel.name + ' (' + hohol.channel.id + ') in guild "' + hohol.guild.name + '" (' + hohol.guild.id + ')');
					} else { // если нет то нет
						console.log(getTimestamp() + " [INFO] " + hohol.author.tag + ' (' + hohol.author.id + ') executed slash command ' + command.name + ' by editing message in channel #' + hohol.channel.name + ' (' + hohol.channel.id + ')');
					}
					async command.run(kitsune, hohol, args); // работать
				};
			});
		};
	} catch(error) { // если ошибка то ошибаться
		funcs.error(error);
	};
});

// логирование приглашений бота на сервер
//kitsune.on("guildCreate", guild => {
//	console.log(getTimestamp() + " [INFO] " + kitsune.user.username + ' was joined to guild "' + guild.name + '" (' + guild.id + ')');
//})
// логирование киков бота с сервера
//kitsune.on("guildDelete", guild => {
//	console.log(getTimestamp() + " [INFO] " + kitsune.user.username + ' was kicked from guild "' + guild.name + '" (' + guild.id + ')');
//})

// готов к работе
kitsune.once('ready', () => {
	//kitsune.guilds.cache.size - TODO logging guilds count
	if (values.maintenance) { // если режим обслуживания
		kitsune.user.setStatus('idle'); // статус нет на месте
		kitsune.user.setActivity('Тех. работы | tech. works'); // статус тех работ
		console.log(getTimestamp() + " [INFO] " + `${kitsune.user.username} is ready to work in maintenance mode! In this mode, bot will reply only to users who have same id as in config (ownerID).`);
	} else { // если всё нормально
		kitsune.user.setStatus('online') // статус в сети
		kitsune.user.setActivity(values.prefix + 'help'); // играет в <prefix>help
		console.log(getTimestamp() + " [INFO] " + `${kitsune.user.username} is ready to work!`);
	};
});

