const Discord = require("discord.js")

class ErrorLog {
    constructor(client, config, commands, customvars, funcs){
		this.name = "errorlog"
		this.customvars = customvars;
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.funcs = funcs;
    }

    async run(client, msg, args, comm, error){
		console.log(error)
		let pubembed = new Discord.MessageEmbed();
		pubembed.setTitle(client.user.username + ' - Error');
		pubembed.setColor(`#F00000`);
		pubembed.setDescription("Произошла ошибка");
		pubembed.setFooter({ text: 'Обратитесь к автору бота, если хотите узнать подробности ошибки (ID: ' + msg.id + ')'})
		msg.channel.send({ embeds: [pubembed] });
		
		let attachments = '';
		msg.attachments.forEach(attach => {attachments += '[' + attach.name + ' (' + attach.id + ')](' + attach.url + ') - ' + attach.contentType + ', ' + Math.floor((attach.size / 1024)) + 'KB\n'});
		
		let privembed = new Discord.MessageEmbed();
		privembed.setTitle(client.user.username + ' - Error');
		privembed.setColor(`#F00000`);
		privembed.setDescription("В команде " + comm.name + " произошла ошибка. Ниже вы можете увидеть данные, которые могли вызвать ошибку.");
		privembed.addField('---== Ошибка ==---', '```\n' + String(error) + '\n```');
		privembed.addField('---== Сообщение пользователя ==---',
		'ID сообщения: ' + msg.id + '\n' +
		'Автор: ' + msg.author.username + '#' + msg.author.discriminator + ' (ID: ' + msg.author.id + ')\n' +
		'Сервер: ' + msg.guild.name + ' (ID: ' + msg.guild.id + ')\n' +
		'Содержание: \n```' + msg.content + '```\n' +
		'Вложения: \n' + attachments);
		privembed.setTimestamp();
		const botowner = await client.users.fetch(comm.config["ownerID"]);
		botowner.send({ embeds: [privembed] });
    }
}

module.exports = ErrorLog

