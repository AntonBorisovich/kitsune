const Discord = require("discord.js")
const pet = require('pet-pet-gif')

class Pat {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = ["AttachFiles"];
		this.category = "fun";
		this.args = "";
		this.usage = "<юзер>";
		this.advargs = "<юзер> - упоминание человека, аватарка которого будет поглажена";
        this.desc = "погладить кого-то/пикчу";
		this.advdesc = "Делает гифку с рукой, которая гладит прикрепленное вами изображение или аватарку пользователя";
        this.name = "pat";
    }

    async run(client, msg, args){
		try {
			let found = false
			//checking attachment availability
			if (args[1]) {
				if (args[1].startsWith('<@') && !args[1].startsWith('<@&')) {
					client.users.fetch(args[1].replace(/([\<\@\!\>])/g, "")).then(member => {work(client, msg, args, member.avatarURL());}); return;
				}
			}
			if (!msg.attachments.first()) {
				if (msg.guild) { // if guild
					if (msg.guild.members.me.permissionsIn(msg.channel).has([Discord.PermissionsBitField.Flags.ReadMessageHistory]) && msg.type == "19" && msg.reference !== null) { // if reply check reply for attach
						const msgrep = await msg.fetchReference()
						if (msgrep.attachments.first()) {
							work(client, msgrep, args);
							return;
						} else {
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(client.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Изображение не найдено. Прикрепи изображение, ответь на сообщение, которое содержит изображение или пингани человека, чью аватарку ты хочешь использовать")
							msg.channel.send({ embeds: [embed] });
							return;
						}
					} else { // if msg isnt reply check last 10 messages for attach
						await msg.channel.messages.fetch({ limit: 10 }).then(lastmsgs => {
							//const lastMessage = messages.first()
							//console.log(lastmsgs)
							//console.log(lastMessage.content)
							let lastattachmsg = ""
							
							lastmsgs.forEach(lastmsg => {
								if (lastmsg.attachments.first()) {
									if (found) {return}
									found = lastmsg
									return;
								}
							})
						})
								
						if (found) {
							work(client, found, args);
							return;
						}
								
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(client.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Изображение не найдено. Прикрепи изображение, ответь на сообщение, которое содержит изображение или пингани человека, чью аватарку ты хочешь использовать")
						msg.channel.send({ embeds: [embed] });
						return;
					}
				}
			} else {
				work(client, msg, args);
				return;
			}
			
			//work
			async function work(client, msg, args, imgurl) {
				if (imgurl) {
					msg.channel.sendTyping()		
					const image = await pet(imgurl.replace(/webp/g, "png"),{resolution: 160, delay: 24})
					msg.channel.send({files: [{attachment: image, name: 'pat.gif'}]})
				} else {
					if (!msg.attachments.first().contentType) {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(client.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Изображение не найдено. Прикрепи изображение, ответь на сообщение, которое содержит изображение или пингани человека, чью аватарку ты хочешь использовать")
						msg.channel.send({ embeds: [embed] });
						return;	
					}
					if (!msg.attachments.first().contentType.startsWith('image')) {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(client.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Изображение не найдено. Прикрепи изображение, ответь на сообщение, которое содержит изображение или пингани человека, чью аватарку ты хочешь использовать")
						msg.channel.send({ embeds: [embed] });
						return;
					}
					if (msg.attachments.first().height > 15000) {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(client.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Изображение слишком большое")
						msg.channel.send({ embeds: [embed] });
						return;
					}
					if (msg.attachments.first().width > 15000) {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(client.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Изображение слишком большое")
						msg.channel.send({ embeds: [embed] });
						return;
					}
					msg.channel.sendTyping()
					const image = await pet(msg.attachments.first().attachment,{resolution: 160, delay: 24})
					msg.channel.send({files: [{attachment: image, name: 'pat.gif'}]})
				}
			}
		} catch(err) {
            let embed = new Discord.EmbedBuilder()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Ошибка:\n```" + err + "\n```")
			msg.channel.send({ embeds: [embed] });;
			
		}
    }
}

module.exports = Pat

