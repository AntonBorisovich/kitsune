const Discord = require("discord.js")
const https = require("https");
const xml2js = require("xml2js");

class r34 {
    constructor(client, config, commands){
		this.vpn = true; 
		this.test = true; 
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "img_NSFW";
		this.args = "<тег>";
		this.advargs = "<тег>\n\nМожно запросить несколько тегов, указав их через пробел. Пример: `s!r34 cum`, `s!r34 kujou_karen futanari`.\n\nБез аргументов будет выдана рандомная пикча";
		this.usage = "<тег>";
        this.desc = "кидает пикчи с rule34.xxx";
        this.advdesc = "Ищет NSFW фотокарточки с сайта rule34.xxx";
        this.name = "r34";
    }
	async testrun(msg, method) {
		try {
			let connection = false
			await https.get("https://api.rule34.xxx/index.php?page=dapi&s=post&q=index", function(res) {
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
			if (msg.channel.nsfw) {
				let url = false
				if (args[1] != undefined) {
					 for (let i=1;i<args.length;i++){
						 argR = argR + " " + args[i]
					 }
				} else {
					url = "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index"
				}
					
				if (!url) {url = "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&tags=" + argR.substring(1)}

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
							var postCount = result.posts.$.count - 1;
							if (postCount > 100) {
								postCount = 100;
							}
							if (postCount > 0) {
								//console.log(result)
								//console.log(result.posts)
								var picNum = Math.floor(Math.random() * postCount) + 0;
								var r34Pic = result.posts.post[picNum].$.file_url;
								var r34Tags = result.posts.post[picNum].$.tags.replace(/ /g, ", ");
								if (r34Pic.startsWith("https://api-cdn-mp4")) {
									var r34PicPreview = result.posts.post[picNum].$.preview_url;
									let embed = new Discord.MessageEmbed()
									embed.setTitle(client.user.username + ' - rule34')
									embed.setDescription("[**Видео**](" + r34Pic + ")")
									embed.setColor(`#F36B00`)
									embed.setImage(r34PicPreview)
									embed.setFooter({ text: "Теги: " + r34Tags.slice(2,-2)})
									msg.channel.send({ embeds: [embed] });
									return	
								} else {
									let embed = new Discord.MessageEmbed()
									embed.setTitle(client.user.username + ' - rule34')
									embed.setColor(`#F36B00`)
									embed.setImage(r34Pic)
									embed.setFooter({ text: "Теги: " + r34Tags.slice(2,-2)})
									msg.channel.send({ embeds: [embed] });
									return
								}
							} else {
								let embed = new Discord.MessageEmbed()
								embed.setTitle(client.user.username + ' - rule34')
								embed.setColor(`#F00000`)
								embed.setDescription("Ничего не найдено   ╮(︶▽︶)╭")
								msg.channel.send({ embeds: [embed] });
								return
							}
						});
					});
				}).on("error", function(e) {
					return
				});
			} else {
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Эту команду можно использовать только в NSFW каналах!")
				msg.channel.send({ embeds: [embed] });
			}
		} catch (e) {
			console.log(e);
			let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Произошла ошибка")
			msg.channel.send({ embeds: [embed] });
		}
    }
}

module.exports = r34

