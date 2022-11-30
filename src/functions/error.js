const Discord = require("discord.js");
const os = require('os');
const launch_time = Date.now();

class Error {
    constructor(){
		this.perms = [""];
        this.name = "error"; // имя функции
		this.desc = "Логирование ошибок"; // описание функции
    }

    async run(kitsune, values, msg, args, commname, error){
		function uptime(){
			let sec = Math.floor((Date.now() - launch_time) / 1000 )
			let min = Math.floor(sec / 60)
			let hour = Math.floor(min / 60)
			let day = Math.floor(hour / 24)
			return day + ' дней ' + (hour - (24 * day)) + ' часов ' + (min - (60 * hour)) + ' минут ' + (sec - (60 * min)) + ' секунд';
		};
		
		
		const ping = Math.round(kitsune.ws.ping); // Замеряем пинг
		
		// Смотрим и запоминаем вложения к сообщению
		let attachments = ""
		msg.attachments.forEach(attach => {
			attachments += "[" + attach.id + "_" + attach.contentType + "](" + attach.url + ")  "
		});
		
		// Формируем лог для разработчиков (full)
		let embed = new Discord.EmbedBuilder()
		embed.setTitle(kitsune.user.username + ' - Error')
		embed.setColor(`#F00000`)
		embed.setDescription('При выполнении команды "' + commname + '" произошла ошибка. Ниже вы можете увидеть отчёт.')
		embed.addFields([
			{name: '---== Ошибка ==---', value: '```\n' + String(error) + '\n```' },
			{name: '---== Сообщение пользователя ==---', value:
				'Пользователь: ' + msg.author.username + '#' + msg.author.discriminator + ' (' + msg.author.id + ')\n' +
				'Сервер: ' + msg.guild.name + ' (' + msg.guild.id + ')\n' +
				'Содержание: `' + msg.content + '`\n' +
				'Вложения: ' + attachments
			},
			{name: '---== Статус бота ==---', value:
				'Пинг: ' + ping + ' мс\n' +
				'Версия бота: ' + values.version + '\n' +
				'Время работы: ' + uptime() + '\n' +
				'ОЗУ: ' + Math.floor( ( os.totalmem() - os.freemem() ) / 1048576 ) + '/' + Math.floor( os.totalmem() / 1048576 ) + 'МБ\n' +
				'Версия Node.js: ' + process.version + '\n'
			}
		]);
		embed.setTimestamp()
		const botowner = await kitsune.users.fetch(values.developers[0]);
		botowner.send({ embeds: [embed] });
		// Формируем лог для пользователей (public)
		let shorterr = false;
		if (!error.name) {
			if (String(error).startsWith('Required permissions not found')) { shorterr = error };
		} else {
			shorterr = "unknown error";
		};
		if (!shorterr) {shorterr = error.name};
		
		if (msg.guild.members.me.permissionsIn(msg.channel).has([Discord.PermissionsBitField.Flags.SendMessages])) { // если мы вообще имеем право на отправку сообщения
			if (msg.guild.members.me.permissionsIn(msg.channel).has([Discord.PermissionsBitField.Flags.EmbedLinks])) { // если можем отправить embed то отправить эмбедом
				let pubembed = new Discord.EmbedBuilder();
				pubembed.setTitle(kitsune.user.username + ' - Error');
				pubembed.setColor(`#F00000`);
				pubembed.setDescription("Произошла ошибка: `" + shorterr + '`');
				pubembed.setFooter({ text: 'Отчёт об ошибке был отправлен разработчикам (' + msg.id + ')'})
				msg.channel.send({ embeds: [pubembed] });
			} else { // если не можем отправить embed то отправить текстом
				msg.channel.send({ content: "**" + kitsune.user.username + " - Error**\n\nПроизошла ошибка: `" + shorterr + '`\n\nОтчёт об ошибке был отправлен разработчикам (' + msg.id + ')'}); // embed-free ошибка
			};
		};
    };
};

module.exports = Error

