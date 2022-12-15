const Discord = require("discord.js")

class Feedback {
    constructor(kitsune, commands, values){
		//задать полученые значения для дальнейшего использования в коде команды
		this.values = values;
        this.kitsune = kitsune;
        this.commands = commands;

		this.perms = [""];
        this.name = "feedback"; // имя команды
		this.desc = "обратная связь"; // описание команды в общем списке команд
		this.advdesc = "Можно написать создателю бота, если вы хотите что-то изменить."; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = "<номер обращения> - номер обращения, полученный вами, когда вы впервые создали обращение. Используется для дополнения уже существующего обращения.\n<текст> - текст вашего обращения в произвольной форме."; // описание аргументов в помоще по конкретной команде
		this.advargs = "<номер обращения> <текст>"; // аргументы в помоще по конкретной команде
    }

    run(kitsune, msg, args){
		let embed = new Discord.EmbedBuilder()
		embed.setTitle(kitsune.user.username + ' - feedback')
		embed.setColor(`#F36B00`)
		embed.setDescription("в разработке")
		msg.channel.send({ embeds: [embed] });	
    }
}

module.exports = Feedback

