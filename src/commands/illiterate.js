const Discord = require("discord.js")

class illiter {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "Fun";
        this.desc = "неграмотный русский";
        this.advdesc = "Превращает написанный вами текст в безграмотную хрень, написанную школьником";
        this.name = "illiter";
		this.args = "<текст>";
		this.usage = "<текст>";
		this.advargs = "<текст>\n\nТекст должен быть на русском";	
    }

    async run(client, msg, args){
		
		function getRandomInt(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min)) + min;
		}
		
		var argR = "";
        if (args[1] != undefined) {
			for (let i=1;i<args.length;i++){
				argR = argR + " " + args[i]
			}
		} else {
			let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Ты не написал текст")
			msg.channel.send({ embeds: [embed] });;
			return
		}	
		
		// correcting letters
		argR = argR.toLowerCase().replace(/([\,\.\!\"\:\<\>\ь\ъ])/g, "").replace(/ё/g, "е").replace(/й/g,"и").replace(/щ/g, "ш");
		
		// correcting words
		argR = argR.replace(/что/gi, "че").replace(/тебе/g, "те").replace(/кого/g, "каво");
		
		// random misspell
		var mass = argR.split(' ');
		var newmass = ""
		await mass.forEach(word => {
			if (word.indexOf('а') > -1 && getRandomInt(1,6) == 4) {
				word = word.replace(/а/g, "о")
			}
			if (word.indexOf('о') > -1 && getRandomInt(1,6) == 4) {
				word = word.replace(/а/g, "а")
			}
			if (word.endsWith('о') && getRandomInt(1,4) == 2 ) {
				word = word.slice(0, -1)
			}
			if (word.endsWith('д') && getRandomInt(1,8) == 2 ) {
				word = word.replace(/д/g, "л")
			}
			if (word.endsWith('л') && getRandomInt(1,8) == 2 ) {
				word = word.replace(/л/g, "д")
			}
			if (getRandomInt(1,20) == 15 ) {
				word = word.slice(0, -1)
			}	
			newmass = newmass + " " + word
		})

		
		let embed = new Discord.MessageEmbed()
		embed.setTitle(client.user.username + ' - illiter')
		embed.setColor(`#F36B00`)
		eval("embed.setDescription('" + newmass.substring(1) + "')")
		msg.channel.send({ embeds: [embed] });;
	}
}

module.exports = illiter

