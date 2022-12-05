const Discord = require("discord.js")

class Ping {
    constructor(kitsune, commands, values){
		//задать полученые значения для дальнейшего использования в коде команды
		this.values = values;
        this.kitsune = kitsune;
        this.commands = commands;
		
		this.perms = [""];
		this.category = "Utils";
		this.args = "";
		this.advargs = "";
		this.usage = "";
        this.desc = "пинг бота";
        this.advdesc = "Проверка соединения бота с дискордами (пинг)";
        this.name = "ping";
    }

    run(kitsune, msg, args){
		try {
			const ping = Math.round(kitsune.ws.ping)
			if (ping) {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Ping')
				embed.setColor(`#F36B00`)
				embed.setDescription("Понг! (" + ping + " мс)") // "\nПоследние пинги: " + this.values.pings.join('мс, ') + "мс")
				msg.channel.send({ embeds: [embed] });	
				//this.funcs.error(kitsune, msg, args, this, "pizda)")
			}
		} catch (err) {
			console.log(err)
			let embed = new Discord.EmbedBuilder()
			embed.setTitle(kitsune.user.username + ' - error')
			embed.setColor(`#F00000`)
			embed.setDescription("Не удалось вычислить задержку")
			msg.channel.send({ embeds: [embed] });
		}
    }
}

module.exports = Ping

