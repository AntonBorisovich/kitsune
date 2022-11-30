const Discord = require("discord.js")
const neko_client = require('nekos.life');
const neko = new neko_client();

class nekos {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
		this.client = client;
		this.config = config;
		this.commands = commands;
		this.perms = [""];
		this.category = "img";
		this.args = "<тег>";
		this.advargs = "```\n" +
		"-= NSFW =-      | -= SFW =-\n"+
		"randomHentaiGif | smug\n"+
		"pussy           | baka\n"+
		"nekoGif_NSFW    | nekoGif\n"+
		"neko_NSFW       | tickle\n"+
		"lesbian         | slap\n"+
		"kuni            | poke\n"+
		"cumsluts        | pat\n"+
		"classic         | neko\n"+
		"boobs           | waifu\n"+
		"bJ              | meow\n"+
		"anal            | lizard\n"+
		"avatar_NSFW     | kiss\n"+
		"yuri            | hug\n"+
		"trap            | foxGirl\n"+
		"tits            | feed\n"+
		"girlSoloGif     | cuddle\n"+
		"girlSolo        | kemonomimi\n"+
		"pussyWankGif    | holo\n"+
		"pussyArt        | woof\n"+
		"kemonomimi_NSFW | goose\n"+
		"kitsune         | gecg\n"+
		"keta            | avatar\n"+
		"holo_NSFW       | \n"+
		"wallpaper       | \n"+
		"holoEro         | \n"+
		"hentai          | \n"+
		"futanari        | \n"+
		"femdom          | \n"+
		"feetGif         | \n"+
		"eroFeet         | \n"+
		"feet            | \n"+
		"ero             | \n"+
		"eroKitsune      | \n"+
		"eroKemonomimi   | \n"+
		"eroNeko         | \n"+
		"eroYuri         | \n"+
		"cumArts         | \n"+
		"blowJob         | \n"+
		"spank           | \n"+
		"gasm            | \n"+
		"-= NSFW =-      | -= SFW =-\n"+
		"```"
		this.usage = "<тег>";
		this.desc = "кидает пикчи с nekos.life";
		this.advdesc = "Отправляет изображения с сайта Nekos.life, в том числе и NSFW";
		this.name = "nekos";
    }

    async run(client, msg, args){
		
		// ["why", "catText", "OwOify", "8Ball", "fact", "spoiler.forEach(tag => {
			// if (tag == args[1]) {
				// try {
					// let embed = new Discord.EmbedBuilder()
					// embed.setTitle(client.user.username + ' - nekos.life')
					// embed.setColor(`#F00000`)
					// embed.setDescription(tag)
					// embed.setImage(picture)
					// msg.channel.send({ embeds: [embed] });;
				// } catch(err){
					// msg.channel.send('err catched ' + err);
				// }
			// }
		// }) 
		var executed = false
		var sfw = ["smug", "baka", "tickle", "slap", "poke", "pat", "neko", "nekoGif", "meow", "lizard", "kiss", "hug", "foxGirl", "feed", "cuddle", "kemonomimi", "holo", "woof", "goose", "gecg", "avatar", "waifu"]
		await sfw.forEach(tag => {
			if (tag.toLowerCase() == args[1].toLowerCase()) {
				executed = true
				eval('neko.sfw.' + tag + '().then(picture => {\n'  +
				'let embed = new Discord.EmbedBuilder()\n' +
				'embed.setTitle(client.user.username + " - nekos.life")\n' +
				'embed.setColor(`#F36B00`)\n' +
				'embed.setDescription(tag)\n' +
				'embed.setImage(picture.url)\n' +
				'msg.channel.send({ embeds: [embed] });\n' +
				'})')
			}
		})
		var nsfw = ["randomHentaiGif", "pussy", "nekoGif_NSFW", "neko_NSFW", "lesbian", "kuni", "cumsluts", "classic", "boobs", "bJ", "anal", "avatar_NSFW", "yuri", "trap", "tits", "girlSoloGif", "girlSolo", "pussyWankGif", "pussyArt", "kemonomimi_NSFW", "kitsune", "keta", "holo_NSFW", "holoEro", "hentai", "futanari", "femdom", "feetGif", "eroFeet", "feet", "ero", "eroKitsune", "eroKemonomimi", "eroNeko", "eroYuri", "cumArts", "blowJob", "spank", "gasm", "wallpaper"]
		await nsfw.forEach(tag => {
			if (tag.toLowerCase() == args[1].toLowerCase()) {
				executed = true
				if (msg.channel.nsfw) {
					if (tag == "wallpaper") {
						neko.sfw.wallpaper().then(picture => {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(client.user.username + " - nekos.life")
						embed.setColor(`#F36B00`)
						embed.setDescription(tag)
						embed.setImage(picture.url)
						msg.channel.send({ embeds: [embed] });
						})
					} else {
						eval('neko.nsfw.' + tag + '().then(picture => {\n'  +
						'let embed = new Discord.EmbedBuilder()\n' +
						'embed.setTitle(client.user.username + " - nekos.life")\n' +
						'embed.setColor(`#F36B00`)\n' +
						'embed.setDescription(tag)\n' +
						'embed.setImage(picture.url)\n' +
						'msg.channel.send({ embeds: [embed] });\n' +
						'})')	
						
					}
				} else {
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Этот тег можно использовать только в NSFW каналах!")
					msg.channel.send({ embeds: [embed] });
				}
			}
		})
		if (!executed) {
			if (!args[1] || args[1] == "") {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(client.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Ты не указал тег\n\nCписок тегов ты можешь посмотреть в " + this.config.prefix + "help " + this.name)
				msg.channel.send({ embeds: [embed] });
			} else {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(client.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Тег не найден\n\nCписок тегов ты можешь посмотреть в " + this.config.prefix + "help " + this.name)
				msg.channel.send({ embeds: [embed] });
			}
		}
	}
}

module.exports = nekos

