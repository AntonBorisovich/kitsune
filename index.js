console.log(getTimestamp() + " [INFO] Starting kitsune for Discord...");

const os = require('os'); // подключение библиотеки os
console.log(getTimestamp() + ' [INFO] Running node ' + process.version + ' on ' + os.platform() + ' with ' + Math.floor((os.totalmem() / 1048576)) + 'MB of RAM');

const Discord = require('discord.js'); // подключение библиотеки discord.js
const kitsune = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGES ], partials: ["CHANNEL"]}); // создание пользователя с правами
const fs = require("fs"); // подключение библиотеки файловой системы (fs)

const launch_time = Date.now(); // время запуска

// склад модулей
let values = {};   // значения
let funcs = {};    // функции
let commands = []; // команды

let errors = []; // список ошибок, произошедших во время инициализации

// Начало инициализации
console.log(getTimestamp() + ' [INFO] (1/3) Loading values...');
init_step1(); // петрович, врубай насос


async function init_step1(){ // загрузка значений
	return await fs.readdir("./src/values/", (err, files)=>{ // загрузить файлы из папки
		if (err) throw err;
		for ( const file of files ) { // перебрать все файлы
			try {
				if (file.endsWith(".json")) { // если .json то работать
					const fileName = file.substring(0,file.length-5); // красивое имя файла для лога
					const variable = require("./src/values/" + file); // чтение значения из файла
					values[fileName] = variable[fileName]; // запись значения в глобальный список
				};
			} catch(err) { // при ошибке лог
				console.error(err);
				errors.push(err.name);
			};
		};
		if (!values.prefix) { // если нет префикска
			errors.push('noPrefix');
		};
		if (!values.discordtoken) { // если нет токена
			errors.push('noDiscordToken');
		};
		if (values.debug) { // если дебаг то сообщить (на всякий)
			console.log(getTimestamp() + ' [INFO] Debug logger enabled');
		};
		console.log(getTimestamp() + ' [INFO] (2/3) Loading functions...');
		init_step2();
	});
};

async function init_step2(){ // загрузка функций
	await fs.readdir("./src/functions/", (err, files) => { // загрузить файлы из папки
		if (err) throw err;
		for ( const file of files ) {// перебрать все файлы
			try {
				if (file.endsWith(".js")) { // если .js то работать
					let fileName = file.substring(0,file.length-3); // красивое имя
					let funky = require("./src/functions/"+fileName); // читаем файл
					let func = new funky(); // вытаскиваем из файла функцию
					funcs[func.name] = func.run; // запись функции в глобальный список
				};
			} catch(err) { // при ошибке лог
				console.error(err);
				errors.push(err.name);
			};
		};
		if (!funcs.error) { // если нет функции логирования ошибок
			errors.push('noErrorlogFunc');
		};
		if (!funcs.log) { // если нет функции общего логирования
			errors.push('noLogFunc');
		};
		console.log(getTimestamp() + ' [INFO] (3/3) Loading commands...');
		init_step3();
	});
};
	
async function init_step3() { // загрузка команд
	await fs.readdir("./src/commands/", (err, files) => {
		if (err) throw err;
		for ( const file of files ) { 
			try {
				if (file.endsWith(".js")) { // если .js то работать
					let fileName = file.substring(0,file.length-3);
					let cmdPrototype = require("./src/commands/"+fileName); // читаем файл
					let command = new cmdPrototype(kitsune, commands, values); // вытаскиваем из файла функцию
					commands.push(command); // запись функции в глобальный список
				};
			} catch(err) {
				console.error(err);
				errors.push(err.name);
			};
		};
		let HelpExists = false;
		for ( const command of commands ) {
			if (command.name == 'help') HelpExists = true;
		};
		if (!HelpExists) {errors.push('noHelpComm')};
		init_step4();
	});
};

async function init_step4() { // проверка ошибок
	if (errors.length > 0) { // если есть ошибки то начать лог
		console.log(getTimestamp() + ' [ERROR] Errors detected: ' + errors.join(', ')); // посылаем инфу в консоль
		if (funcs.log && values.discordtoken) { // если есть чем и куда логировать
			kitsune.login(values.discordtoken); // логин в дискорд (далее чек ошибок в once.ready)
			return;
		} else { // если нечем логировать
			console.log(getTimestamp() + ' [ERROR] Failed to report the error');
			process.exit(1); // выходим из js
			return;
		};
		return;
	};
	
	// всё ок. логируем о хорошем и входим в дискорд
	console.log(getTimestamp() + ' [INFO] Components loaded successfully. ' + ((Date.now() - launch_time) / 1000 ) + 's');
	console.log(getTimestamp() + ' [INFO] Logging in Discord...' );
	kitsune.login(values.discordtoken); 
};

// функция логирования времени
function getTimestamp() {
	var date = new Date(); // задаём текущую поеботу

	// преобразуем всю поеботу в нормальный вид
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
	
	return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + hours + ":" + mins + ":" + seconds; // выводим красивую поеботу
};

// обработка нового сообщения
kitsune.on("messageCreate", async msg => {
	if (values.debug && values.developers[0] != msg.author.id || msg.author.bot) return; // игнор бота и игнор всех в дебаг режиме
	// TODO пропуск тестеров
	
	let args = msg.content.split(" "); // форматируем аргументы
	if (args[0].toLowerCase().startsWith(values.prefix)) { // если сообщение начинается с префикса то работать
		let cmd = args[0].substring(values.prefix.length) // получаем имя вызываемой команды из сообщения
		commands.forEach(command => { // перебираем список команд в боте
			if (command.name == cmd.toLowerCase()) { // если команда в сообщении совпала с командой из списка бота то работать	
				let running_comm = ''
				if (msg.guild) { // если вызвано на сервере то проверить права
					const permissions = ['SEND_MESSAGES', 'EMBED_LINKS', ...command.perms]; // задаём права, которые надо проверить
					const missing = msg.channel.permissionsFor(msg.client.user).missing(permissions); // проверяем права в канале
					if (!missing[0] == "") { // если какое либо право не найдено то паника
						funcs.error(kitsune, values, msg, args, command.name, "Required permissions not found: " + missing.join(', '));
						if (!missing.includes("SEND_MESSAGES") && !missing.includes("EMBED_LINKS")) {
							funcs.error(kitsune, values, msg, args, command.name, '');
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
					//funcs.log(kitsune, 'info', 'information', values)
					command.run(kitsune, msg, args); // запуск команды
				} catch (error) { // если ошибка то логировать ошибку
					funcs.error(kitsune, values, msg, args, command.name, error);
				};
			};
		});
	};
});

// обработка получения изменённого сообщения
// TODO (обработка сообщения, таймаут-антиспам)
//kitsune.on('messageUpdate', async (oldMsg, msg) => { });

// обработка интерактивного элемента (кнопки, слэш-команды)
// TODO
//kitsune.on('interactionCreate', async (oldMsg, msg) => { });

// залогинились. теперь логируем об этом, задаём статусы и т.д.
kitsune.once('ready', () => {
	delete values.discordtoken; // чистим токен из памяти когда залогинились
	console.log(getTimestamp() + " [INFO] Logged in");
	
	if (errors.length > 0) { // если есть ошибки то логировать
		kitsune.user.setStatus('invisible'); // статус невидимки
		funcs.log(kitsune, 'syserror', 'Errors occurred during the loading:\n`' + errors.join(', ') + '`\nCheck the console for more information', values); // отсылаем отчёт
		setTimeout(() => { // ожидаем пока сообщение точно отправится
			console.log(getTimestamp() + " [INFO] " + `${kitsune.user.username} sent a report to the developers. Logging out...`);
			kitsune.destroy(); // выходим из дискорда
			process.exit(1); // выходим из js
		}, 2000);
	} else { // если нет ошибок то запуск
		// установка статуса
		if (values.debug) { // если дебаг
			kitsune.user.setStatus('idle'); // статус не беспокоить
			kitsune.user.setActivity('debug'); // играет в дебаг
		} else { // если всё нормально
			kitsune.user.setStatus('online'); // статус в сети
			kitsune.user.setActivity(values.prefix + 'help'); // играет в <prefix>help
		};
		console.log(getTimestamp() + " [INFO] " + `Serving ${kitsune.guilds.cache.size} guilds`);
		console.log(getTimestamp() + " [INFO] " + `Total launch time: ${((Date.now() - launch_time) / 1000 )}s`);
		console.log(getTimestamp() + " [INFO] " + `${kitsune.user.username} (ver: ${values.version}) is ready to work!`);
	}
});
