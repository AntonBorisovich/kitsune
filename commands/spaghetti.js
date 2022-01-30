const Discord = require("discord.js")
const {PythonShell} = require('python-shell')
const waifu2x = "todo"

class Spaghetti {
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
        this.desc = "пикча -> макароны hide";
        this.advdesc = 'Нарисовать прикреплённое изображение с помощью макарон';
        this.name = "spaghetti";
    }

    run(client, msg, args){
		try {
			//checking attachment availability
			if (!msg.attachments.first()) {
				if (msg.guild) { // if guild
					if (msg.channel.permissionsFor(msg.client.user).missing("READ_MESSAGE_HISTORY") && msg.type == "REPLY" && msg.reference !== null) { // if reply check reply for attach
						const msgrep = await msg.fetchReference()
						if (msgrep.attachments.first()) {
							let embed = new Discord.MessageEmbed()
							embed.setTitle(client.user.username + ' - spaghetti')
							embed.setColor(`#F00000`)
							embed.setDescription("Мы нашли изображение, но мы не можем его использовать. Пожалуйста, прикрепите изображение к сообщению (TODO: подтверждение обработки найденых сообщений кнопкой)")
							msg.channel.send({ embeds: [embed] });
							return;
						} else {
							let embed = new Discord.MessageEmbed()
							embed.setTitle(client.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение")
							msg.channel.send({ embeds: [embed] });
							return;
						}
					} else { // if msg isnt reply check last 10 messages for attach
						let found = ""
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
							let embed = new Discord.MessageEmbed()
							embed.setTitle(client.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Мы нашли изображение, но мы не можем его использовать. Пожалуйста, прикрепите изображение к сообщению (TODO: подтверждение обработки найденых сообщений кнопкой)")
							msg.channel.send({ embeds: [embed] });
							return;
						}
								
						let embed = new Discord.MessageEmbed()
						embed.setTitle(client.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение")
						msg.channel.send({ embeds: [embed] });
						return;
					}
				}
			} else {
				work(client, msg, args);
				return;
			}
			
			//work
			async function work(client, msg, args) {
				
				if (!msg.attachments.first().contentType) {
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение")
					msg.channel.send({ embeds: [embed] });
					return;	
				}
				if (!msg.attachments.first().contentType.startsWith('image')) {
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение")
					msg.channel.send({ embeds: [embed] });
					return;
				}
				if ((msg.attachments.first().size / 1048576) > 8) {
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Слишком большое изображение")
					msg.channel.send({ embeds: [embed] });
					return
				}
				
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - spaghetti')
				embed.setColor(`#F36B00`)
				embed.setDescription("in dev (todo: install waifu2x_node and shitty stuff for it, optimize python script for linux)")
				msg.channel.send({ embeds: [embed] });
				return
				
				// write msg.attachments.first() to file. !! NOT BUFFER !!
				
				// edit python scripts to read file written above
				await PythonShell.run('assets/spaghetti/main.py', null, async function (err,code,signal) {
					
				})
				
				const image // read temp file
				msg.channel.send({files: [image]})
			}
		} catch(err) {
            let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Ошибка:\n```" + err + "\n```")
			msg.channel.send({ embeds: [embed] });;
			
		}
    }
}
    }
}

module.exports = Spaghetti

