const Discord = require("discord.js");
const twofactor = require("node-2fa");
const fs = require("fs");
const {dependencies} = require('../../package.json');

class Update {
    constructor(kitsune, commands, values){
		
		//задать полученые значения для дальнейшего использования в коде команды
		this.values = values;
        this.kitsune = kitsune;
        this.commands = commands;
		
		this.root = true; // запуск только разработчикам
		this.perms = [""];
        this.name = "update"; // имя команды
		this.desc = "обновление бота"; // описание команды в общем списке команд
		this.advdesc = "Применение обновления из zip файла"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = "<пароль> - 2FA код"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<пароль>"; // аргументы в помоще по конкретной команде
    }

    run(kitsune, msg, args){
		if (!this.values.twofasecret) { // если код уже не задан, то задать его
			const newsecret = twofactor.generateSecret({ name: kitsune.user.username, account: msg.author.username})
			let embed = new Discord.MessageEmbed()
			embed.setTitle(kitsune.user.username + ' - 2FA')
			embed.setColor(`#F36B00`)
			embed.setDescription('Вот твой новый 2FA код.\nТы можешь его отсканировать и добавть в любое 2FA TOTP приложение или ввести код ниже вручную.\n\n|| ' + newsecret.secret + ' ||\n\nЕсли ты не делал ничего, что бы получить этот код, то удалите src/values/twofasecret.json')
			embed.setImage(newsecret.qr)
			msg.author.send({ embeds: [embed] });
			
			this.values.twofasecret = newsecret.secret;
			fs.writeFile('./src/values/twofasecret.json', '{"twofasecret": "' + newsecret.secret + '"}', (err) => {
				  if (err) {
					let embed = new Discord.MessageEmbed()
					embed.setTitle(kitsune.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("```\n" + err + "\n```")
					msg.channel.send({ embeds: [embed] });
					console.error(err)
					return
				  }
				})
		} else {
			let embed = new Discord.MessageEmbed();
			embed.setTitle(kitsune.user.username + ' - ' + this.name);
			embed.setColor(`#F36B00`);
			embed.setDescription('TODO:\n- обновление бота\n- предупреждать, если команда запущена в канале, а не в лс\n -пихнуть куда-нибудь гачи-пароль');
			msg.channel.send({embeds: [embed]});
		};
	}
}

module.exports = Update

