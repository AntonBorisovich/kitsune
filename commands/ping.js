const Discord = require("discord.js")

class Ping {
    constructor(client, config, commands){
        this.client = client;
        this.config = config;
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

    run(client, msg, args){
		const ping = Math.round(client.ws.ping)
		if (ping) {
			let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - Ping')
			embed.setColor(`#F36B00`)
			embed.setDescription("Понг! (" + ping + " мс)")
			msg.channel.send({ embeds: [embed] });	
		}
    }
}

module.exports = Ping

