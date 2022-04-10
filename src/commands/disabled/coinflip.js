const Discord = require("discord.js")

class coinflip {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "Fun";
		this.args = "";
		this.advargs = "";
		this.usage = "";
        this.desc = "подкинуть монетку";
        this.advdesc = "Простой рандомайзер, шансы 50/50 для орла и решки, но монетка может упасть и ребром";
        this.name = "coinflip";
    }

    run(client, msg, args){
		const random = Math.floor(Math.random() * (1005));
		if (random > 500) {
			if (random > 1000) {
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - coinflip')
				embed.setColor(`#F36B00`)
				embed.setDescription("Ребро! :last_quarter_moon:")
				msg.channel.send({ embeds: [embed] });
			} else {
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - coinflip')
				embed.setColor(`#F36B00`)
				embed.setDescription("Решка! :new_moon:")
				msg.channel.send({ embeds: [embed] });
			}
		} else {
			let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - coinflip')
			embed.setColor(`#F36B00`)
			embed.setDescription("Орел! :full_moon:")
			msg.channel.send({ embeds: [embed] });
		}

    }
}

module.exports = coinflip

