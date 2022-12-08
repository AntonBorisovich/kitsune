console.log(getTimestamp() + " [INFO] Starting kitsune for Discord...");

const os = require('os'); // подключение библиотеки получение данных о системе (os)
console.log(getTimestamp() + ' [INFO] Running node ' + process.version + ' on ' + os.platform() + ' with ' + Math.floor((os.totalmem() / 1048576)) + 'MB of RAM');

const Discord = require('discord.js'); // подключение библиотеки Discord API (discord.js)
const kitsune = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.DirectMessages, Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.MessageContent], partials: [Discord.Partials.Channel]}); // создание пользователя с правами
const fs = require("fs"); // подключение библиотеки файловой системы (fs)

const launch_time = Date.now(); // запоминаем время запуска

// склад модулей
let values = {};    // значения
let funcs = {};     // функции
let commands = [];  // команды

let errors = [];    // список ошибок, произошедших во время инициализации

let timeoutid = []; // список id пользователей, которые находятся в 2 секундном тайм-ауте
values.pings = []      // список последних пингов до серверов Discord (для отлавливания проблем с интернетом)

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
		init_step2(); // следующий этап
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
		init_step3(); // следующий этап
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
		init_step4(); // следующий этап
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
	console.log(getTimestamp() + ' [INFO] Initialization completed successful. ' + ((Date.now() - launch_time) / 1000 ) + 's');
	console.log(getTimestamp() + ' [INFO] Logging in Discord...' );
	kitsune.login(values.discordtoken); // логинимся
};

// функция логирования времени
function getTimestamp() {
	var date = new Date(); // задаём текущую поеботу

	// преобразуем всю поеботу в нормальный вид (что бы было не 2.3.2022, а 02.03.2022)
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

function checkInternet(kitsune) { // Проверка интернета каждые 50 секунд. Если пинг будет одним и тем же 10 раз подряд, то будем считать, что соединение оборвано
	//console.log(getTimestamp() + ' [DEBUG] Ping: ' + kitsune.ws.ping)
	if (values.pings.length == 10) { values.pings.shift() }; // если слишком много пингов, то удалить самый старый
	values.pings.push(kitsune.ws.ping);
	
	if (values.pings.filter(item => item === values.pings[0]).length == 10) { // если в массиве 10 одинаковых пингов
		console.log(getTimestamp() + ' [ERROR] Latest latencies (' + values.pings + ') are identical. We might lost connection to discord server!');
		console.log(getTimestamp() + ' [INFO] Logging out...');
		fs.writeFile('./src/values/ping_failure.json', '{"ping_failure": true}', function (err) {
		  if (err) return console.log(err);
		});
		kitsune.destroy() // отключаемся
		setTimeout(() => {
			process.exit(1); // выходим из js
		}, 2500);
	} else {
		setTimeout(() => { // repeat again in 50 secs
			checkInternet(kitsune)
		}, 50000);
	};
};

// обработка нового сообщения
kitsune.on("messageCreate", async msg => {
	/* try {
		if (msg.channelId == 750403949202243695) { // новости ъеъ
			msg.react('<:neeet:1039589647032012930>'); // ?
		};
		if (msg.channelId == 838430531188162640) { // dev-log ъеъ
			var date = new Date(); // задаём текущую поеботу
			msg.react('🤮'); // озон одобряет
			msg.channel.threads.create({ // пишем отзыв об обновлении
				name: 'бл (' + date.getFullYear() + "." + (date.getMonth() + 1) + "." + date.getDate() + ')',
				startMessage: msg,
				reason: 'вадим любит коки (' + (date.getMonth() + 1) + "." + date.getDate() + ')'
			}).then(threadChannel => threadChannel.send('кринжатина. лучше бы не писал ничего <:bravo:1039589650773315584>'));
		};
	} catch(err) {
		console.log('Failed to place reaction to the message')
	}; */

	if (values.debug && values.developers[0] != msg.author.id || msg.author.bot) return; // игнор бота и игнор всех в дебаг режиме
	if (timeoutid.indexOf(msg.author.id) != -1) return; // проверяем в тайм-ауте ли пользователь
	timeoutid.push(msg.author.id); // добавляем пользователя в тайм-аут
	setTimeout(() => { // через 2 секунды снимаем пользователя с тайм-аута
		const index = timeoutid.indexOf(msg.author.id); // чекаем есть ли id в тайм-ауте
		if (index !== -1) { timeoutid.splice(index, 1) }; // удаляем из тайм-аута
	}, 2000);
	
	let args = msg.content.split(" "); // форматируем аргументы
	if (args[0].toLowerCase().startsWith(values.prefix)) { // если сообщение начинается с префикса то работать
		let cmd = args[0].substring(values.prefix.length) // получаем имя вызываемой команды из сообщения
		commands.forEach(command => { // перебираем список команд в боте
			if (command.name == cmd.toLowerCase()) { // если команда в сообщении совпала с командой из списка бота то работать	
				let running_comm = ''
				if (msg.guild) { // если вызвано на сервере то проверить права
					let permissions = [];
					if (msg.channel.type === Discord.ChannelType.GuildForum || msg.channel.type === Discord.ChannelType.GuildPublicThread || msg.channel.type === Discord.ChannelType.GuildPrivateThread) {
						permissions = ['SendMessages', 'SendMessagesInThreads', 'EmbedLinks', ...command.perms]; // задаём права, которые надо проверить
					} else {
						permissions = ['SendMessages', 'EmbedLinks', ...command.perms]; // задаём права, которые надо проверить
					}
					
					let missing = []
					permissions.forEach(perm => { // чекаем каждый пермишн
							if (perm) { // если строка случайно не пустая
								eval("if (!msg.guild.members.me.permissionsIn(msg.channel).has([Discord.PermissionsBitField.Flags." + perm + "])) { missing.push('" + perm + "') }") // дикий костыль но работает
							};
					});
					if (!missing[0] == "") { // если какое либо право не найдено то паника
						funcs.error(kitsune, values, msg, args, command.name, "Required permissions not found: " + missing.join(', '));
						return;
					};
				};
				if (msg.author.id == "482209243714551818" || msg.author.id == "842879459132833813" && command.name == "china") { // бан чумы за долбоебизм
					let embed = new Discord.EmbedBuilder()
					embed.setTitle('банан')
					embed.setColor(`#ffb8c2`)
					embed.setDescription("ха-ха. плоти нологи :money_with_wings:")
					msg.reply({ embeds: [embed] });
					return;
				}
				try {
					console.log(getTimestamp() + " [INFO] executed command " + command.name); // логирование о проходе всех проверок и начале запуске команды
					command.run(kitsune, msg, args); // запуск команды
				} catch (error) { // если ошибка то логировать ошибку
					funcs.error(kitsune, values, msg, args, command.name, error);
				};
			};
		});
	};
});

// обработка получения изменённого сообщения
kitsune.on('messageUpdate', async (oldMsg, msg) => {
	if (values.debug && values.developers[0] != msg.author.id || msg.author.bot) return; // игнор бота и игнор всех в дебаг режиме
	if (timeoutid.indexOf(msg.author.id) != -1) return; // проверяем в тайм-ауте ли пользователь
	timeoutid.push(msg.author.id); // добавляем пользователя в тайм-аут
	setTimeout(() => { // через 5 секунд снимаем пользователя с тайм-аута
		const index = timeoutid.indexOf(msg.author.id); // чекаем есть ли id в тайм-ауте
		if (index !== -1) { timeoutid.splice(index, 1) }; // удаляем из тайм-аута
	}, 2000);
	
	let args = msg.content.split(" "); // форматируем аргументы
	if (args[0].toLowerCase().startsWith(values.prefix)) { // если сообщение начинается с префикса то работать
		let cmd = args[0].substring(values.prefix.length) // получаем имя вызываемой команды из сообщения
		commands.forEach(command => { // перебираем список команд в боте
			if (command.name == cmd.toLowerCase()) { // если команда в сообщении совпала с командой из списка бота то работать	
				let running_comm = ''
				if (msg.guild) { // если вызвано на сервере то проверить права
					let permissions = [];
					if (msg.channel.type === Discord.ChannelType.GuildForum || msg.channel.type === Discord.ChannelType.GuildPublicThread || msg.channel.type === Discord.ChannelType.GuildPrivateThread) {
						permissions = ['SendMessages', 'SendMessagesInThreads', 'EmbedLinks', ...command.perms]; // задаём права, которые надо проверить
					} else {
						permissions = ['SendMessages', 'EmbedLinks', ...command.perms]; // задаём права, которые надо проверить
					}
					
					let missing = []
					permissions.forEach(perm => { // чекаем каждый пермишн
							if (perm) { // если строка случайно не пустая
								eval("if (!msg.guild.members.me.permissionsIn(msg.channel).has([Discord.PermissionsBitField.Flags." + perm + "])) { missing.push('" + perm + "') }") // дикий костыль но работает
							};
					});
					if (!missing[0] == "") { // если какое либо право не найдено то паника
						funcs.error(kitsune, values, msg, args, command.name, "Required permissions not found: " + missing.join(', '));
						return;
					};
				};
				if (msg.author.id == "482209243714551818" || msg.author.id == "842879459132833813" && command.name == "china") { // бан чумы за долбоебизм
					let embed = new Discord.EmbedBuilder()
					embed.setTitle('банан')
					embed.setColor(`#ffb8c2`)
					embed.setDescription("ха-ха. плоти нологи :money_with_wings:")
					msg.reply({ embeds: [embed] });
					return;
				}
				try {
					console.log(getTimestamp() + " [INFO] executed command " + command.name); // логирование о проходе всех проверок и начале запуске команды
					command.run(kitsune, msg, args); // запуск команды
				} catch (error) { // если ошибка то логировать ошибку
					funcs.error(kitsune, values, msg, args, command.name, error);
				};
			};
		});
	};
});

// обработка интерактивного элемента (кнопки, слэш-команды)
// TODO
//kitsune.on('interactionCreate', async (oldMsg, msg) => { });

// залогинились. теперь логируем об этом, задаём статусы и т.д.
kitsune.once('ready', () => {
	console.log(getTimestamp() + " [INFO] Logged in"); // уведомляем об успешном входе
	delete values.discordtoken; // чистим токен из памяти когда залогинились
	if (errors.length > 0) { // если есть ошибки то логировать
		kitsune.user.setStatus('invisible'); // статус невидимки
		funcs.log(kitsune, 'syserror', 'Errors occurred during the loading:\n`' + errors.join(', ') + '`\nCheck the console for more information', values); // отсылаем отчёт
		console.log(getTimestamp() + " [INFO] " + `${kitsune.user.username} sent a report to the developers. Logging out...`);
		setTimeout(() => { // ожидаем пока сообщение точно отправится
			kitsune.destroy(); // выходим из дискорда
			process.exit(1); // выходим из js
		}, 3000);
	} else { // если нет ошибок то запуск
		if (values.ping_failure) {
			fs.unlink('./src/values/ping_failure.json', (err) => {
			  if (err) throw err;
			});
			delete values.ping_failure
			funcs.log(kitsune, 'syswarning', 'A connection error occurred last boot, but we successfully reloaded and ready to go!', values); // отсылаем отчёт
		};
		values.pings.push(kitsune.ws.ping) // пишем пинг
		setTimeout(() => { // запуск цикла проверки интернета
			checkInternet(kitsune)
		}, 5000);
		// установка статуса
		if (values.debug) { // если дебаг
			kitsune.user.setStatus('idle'); // статус не беспокоить
			kitsune.user.setActivity('debug'); // играет в дебаг
		} else { // если всё нормально
			kitsune.user.setStatus('online'); // статус в сети
			kitsune.user.setActivity(values.prefix + 'help'); // играет в <prefix>help
		};
		console.log(getTimestamp() + " [INFO] " + `Total launch time: ${((Date.now() - launch_time) / 1000 )}s`);
		//console.log(getTimestamp() + " [INFO] " + `${kitsune.user.username} (ver: ${values.version}) is ready to work!`);
		funcs.log(kitsune, 'sysinfo', kitsune.user.username + ' (ver: ' + values.version + ') is ready to work!', values); // отсылаем отчёт
	};
});
