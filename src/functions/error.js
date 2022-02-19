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

    async run(client, msg, args, comm, error, privateerr){
		if (privateerr) {
			let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Произошла ошибка")
			msg.channel.send({ embeds: [embed] });
		} else {
			let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Произошла ошибка:\n```" + String(error) + "\n```")
			msg.channel.send({ embeds: [embed] });
		}
		let attachments = ""
		msg.attachments.forEach(attach => {
			attachments += "[" + attach.id + "_" + attach.contentType + "](" + attach.url + ")  "
		})
		
		let embed = new Discord.MessageEmbed()
		embed.setTitle(client.user.username + ' - Error')
		embed.setColor(`#F00000`)
		embed.setDescription("В команде " + comm.name + " произошла ошибка. Ниже вы можете увидеть данные, которые возможно вызвали ошибку.")
		embed.addField('---== Ошибка ==---', '```\n' + String(error) + '\n```')
		embed.addField('---== Сообщение пользователя ==---',
		'Автор: ' + msg.author.username + '#' + msg.author.discriminator + ' (' + msg.author.id + ')\n' +
		'Сервер: ' + msg.guild.name + ' (' + msg.guild.id + ')' +
		'Содержание: `' + msg.content + '`\n' +
		'Вложения: ' + attachments)
		embed.setTimestamp()
		const botowner = await client.users.fetch(comm.config["ownerID"]);
		botowner.send({ embeds: [embed] });
    }
}

module.exports = ErrorLog

