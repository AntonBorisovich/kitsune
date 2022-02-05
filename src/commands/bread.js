const Discord = require("discord.js")
const search = require("g-i-s")

class Bread {
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
        this.desc = "кидает пикчи с хлебом";
        this.advdesc = "Ищет фотокарточки с хлебом в Google";
        this.name = "bread";
    }

    async run(client, msg, args){
		function bread(error, results) {
			if (error) {
				console.log(error);
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("```\n" + String(error) + "\n```")
				msg.channel.send({ embeds: [embed] });
			} else {
				let bread_pic = JSON.parse(JSON.stringify(results))
				let pic_num = Math.floor(Math.random() * (bread_pic.length));
				bread_pic = bread_pic[pic_num].url;
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - bread')
				embed.setImage(bread_pic)
				embed.setColor(`#F36B00`)
				//embed.setDescription(this.name)
				msg.channel.send({ embeds: [embed] });
			}
		}
		msg.channel.sendTyping()
		search('bread', bread)
		//console.log(bread)    	
    }
}

module.exports = Bread

