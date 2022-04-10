const Discord = require("discord.js")
const https = require("https");
const xml2js = require("xml2js");

class Sfbr {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
		this.vpn = true; 
		this.test = true; 
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "img";
		this.args = "<тег>";
		this.advargs = "<тег>\n\nМожно запросить несколько тегов указав их через пробел. Пример: `s!sfbr gawr_gura`, `s!sfbr hololive popsicle`\n[Полный гайд по тегам](https://safebooru.org/index.php?page=help&topic=cheatsheet)\n\nБез аргументов будет выдана рандомная пикча";
		this.usage = "<тег>";
        this.desc = "кидает пикчи с safebooru.org";
        this.advdesc = "Ищет фотокарточки на сайте safebooru.org";
        this.name = "sfbr";
    }
	async testrun(msg, method) {
		try {
			let connection = false
			await https.get("https://safebooru.org/index.php?page=dapi&s=post&q=index", function(res) {
				res.on("data", function(chunk) {
					connection = true
				});
				res.on("end", function() {
					connection = true
				});
			}).on("error", function(e) {
				connection = e
			});
			function sleep(ms) {
				return new Promise(resolve => setTimeout(resolve, ms));
			}
			await sleep(7000);
			if (connection) { return "OK!" } else { return connection }
		} catch(err) {
			return err;
		}
	}
    async run(client, msg, args){
		try {
			var argR = "";
			let url = false
			if (args[1] != undefined) {
				 for (let i=1;i<args.length;i++){
					 argR = argR + " " + args[i]
				 }
			} else {
				url = "https://safebooru.org/index.php?page=dapi&s=post&q=index"
			}
					
			if (!url) {url = "https://safebooru.org/index.php?page=dapi&s=post&q=index&tags=" + argR.substring(1)}

			await https.get(url, function(res) {
				var body = "";

				res.on("data", function(chunk) {
					body += chunk;
				});

				res.on("end", function() {
					//console.log(body)
					//return
					var parser = new xml2js.Parser();
					parser.parseString(body, function(err, result) {
						//console.log(result)
						//console.log(result.posts)
						if (!result) {
							let embed = new Discord.MessageEmbed()
							embed.setTitle(client.user.username + ' - safebooru')
							embed.setColor(`#F00000`)
							embed.setDescription("Ничего не найдено   ╮(︶▽︶)╭")
							msg.channel.send({ embeds: [embed] });
							return
						}
						var postCount = result.posts.$.count - 1;
						if (postCount > 100) {
							postCount = 100;
						}
						if (postCount > 0) {
							console.log(result)
							//console.log(result.posts)
							var picNum = (Math.floor((Math.random() - 0.0001) * postCount) + 1);
							var sfbrPic = result.posts.post[picNum].$.file_url;
							var sfbrTags = result.posts.post[picNum].$.tags.replace(/ /g, ", ");
							let embed = new Discord.MessageEmbed()
							embed.setTitle(client.user.username + ' - safebooru')
							embed.setColor(`#F36B00`)
							embed.setImage(sfbrPic)
							embed.setFooter({ text: "Теги: " + sfbrTags.slice(2,-2)})
							msg.channel.send({ embeds: [embed] });
							return
						} else {
							let embed = new Discord.MessageEmbed()
							embed.setTitle(client.user.username + ' - safebooru')
							embed.setColor(`#F00000`)
							embed.setDescription("Ничего не найдено   ╮(︶▽︶)╭")
							msg.channel.send({ embeds: [embed] });
							return
						}
					});
				});
			}).on("error", function(e) {
				console.log(e);
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Произошла ошибка")
				embed.setFooter({ text: String(e)})
				msg.channel.send({ embeds: [embed] });
				return
			});
		} catch (e) {
			console.log(e);
			let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Произошла ошибка")
			embed.setFooter({ text: String(e)})
			msg.channel.send({ embeds: [embed] });
		}
    }
}

module.exports = Sfbr

