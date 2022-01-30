const Discord = require("discord.js")

class Upscale {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = ["ATTACH_FILES"];
		this.category = "Fun";
		this.args = "";
		this.advargs = "";
		this.usage = "";
        this.desc = "апскелйер пикч hide";
        this.advdesc = 'Повышение качества прикреплённого изображения алгоритмом "Waifu2x", который отлично подходит для улучшения изображений в аниме стилистике';
        this.name = "upscale";
    }

    run(client, msg, args){
		let embed = new Discord.MessageEmbed()
		embed.setTitle(client.user.username + ' - upscale')
		embed.setColor(`#F36B00`)
		embed.setDescription("in dev\n\ntodo: install waifu2x_node and other stuff for it")
		msg.channel.send({ embeds: [embed] });	
    }
}

module.exports = Upscale

