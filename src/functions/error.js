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
		let embed = new Discord.MessageEmbed()
		embed.setTitle(kitsune.user.username + ' - Error')
		embed.setColor(`#F00000`)
		embed.setDescription('При выполнении команды "' + commname + '" произошла ошибка. Ниже вы можете увидеть отчёт.')
		embed.addField('---== Ошибка ==---', '```\n' + String(error) + '\n```')
		embed.addField('---== Сообщение пользователя ==---',
		'Пользователь: ' + msg.author.username + '#' + msg.author.discriminator + ' (' + msg.author.id + ')\n' +
		'Сервер: ' + msg.guild.name + ' (' + msg.guild.id + ')\n' +
		'Содержание: `' + msg.content + '`\n' +
		'Вложения: ' + attachments)
		embed.addField('---== Статус бота ==---',
		'Пинг: ' + ping + ' мс\n' +
		'Версия бота: ' + values.version + '\n' +
		'Время работы: ' + uptime() + '\n' +
		'ОЗУ: ' + Math.floor( ( os.totalmem() - os.freemem() ) / 1048576 ) + '/' + Math.floor( os.totalmem() / 1048576 ) + 'МБ\n' +
		'Версия Node.js: ' + process.version + '\n')
		embed.setTimestamp()
		const botowner = await kitsune.users.fetch(values.developers[0]);
		botowner.send({ embeds: [embed] });
		
		// Формируем лог для пользователей (public)
		let pubembed = new Discord.MessageEmbed();
		pubembed.setTitle(kitsune.user.username + ' - Error');
		pubembed.setColor(`#F00000`);
		pubembed.setDescription("Произошла ошибка: `" + error.name + '`');
		pubembed.setFooter({ text: 'Отчёт об ошибке был отпрален разработчикам (' + msg.id + ')'})
		msg.channel.send({ embeds: [pubembed] });
    };
};

module.exports = Error

