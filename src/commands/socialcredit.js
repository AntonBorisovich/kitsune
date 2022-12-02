const Discord = require("discord.js")
const request = require("request");
const https = require("https");

let timeoutidextend = []; // список id пользователей, которые находятся в 15 секундном тайм-ауте

class Socialcredit {
	constructor(kitsune, config, commands, values){
		//задать полученые значения для дальнейшего использования в коде команды
		this.values = values;
        this.kitsune = kitsune;
        this.commands = commands;
		
		//this.twofa = false; // запуск только разработчикам
		this.perms = ["AttachFiles"];
        this.name = "china"; // имя команды
		this.desc = "吮吸我的蛋蛋"; // описание команды в общем списке команд
		this.advdesc = "此命令从站点 \"不同维度我\" 生成图像 https://h5.tu.qq.com/web/ai-2d/cartoon/index"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = ""; // описание аргументов в помоще по конкретной команде
		this.advargs = ""; // аргументы в помоще по конкретной команде
    }

    async run(kitsune, msg, args){
		if (timeoutidextend.indexOf(msg.author.id) != -1) { // проверяем в тайм-ауте ли пользователь
			let embed = new Discord.EmbedBuilder()
			embed.setTitle(kitsune.user.username + ' - Cooldown')
			embed.setColor(`#F00000`)
			embed.setDescription("Погоди немного, братишка. Чё моросишь?")
			msg.channel.send({ embeds: [embed] });
			return;
		}; 
		timeoutidextend.push(msg.author.id); // добавляем пользователя в тайм-аут
		setTimeout(() => { // через 15 секунд снимаем пользователя с тайм-аута
			const index = timeoutidextend.indexOf(msg.author.id); // чекаем есть ли id в тайм-ауте
			if (index !== -1) { timeoutidextend.splice(index, 1) }; // удаляем из тайм-аута
		}, 15000);
		
		if (!msg.attachments.first()) {
			if (msg.guild) { // if guild
				if (msg.guild.members.me.permissionsIn(msg.channel).has([Discord.PermissionsBitField.Flags.ReadMessageHistory]) && msg.type == "19" && msg.reference !== null) { // if reply check reply for attach
					const msgrep = await msg.fetchReference()
					if (msgrep.attachments.first()) {
						await downloadimg(kitsune, msgrep, args);
						return;
					} else {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(kitsune.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение")
						msg.channel.send({ embeds: [embed] });
						return;
					}
				} else { // if msg isnt reply check last 7 messages for attach
					let found = ""
					await msg.channel.messages.fetch({ limit: 7 }).then(lastmsgs => {
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
						await downloadimg(kitsune, found, args);
						return;
					}
							
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(kitsune.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение")
					msg.channel.send({ embeds: [embed] });
					return;
				}
			}
		} else {
			await downloadimg(kitsune, msg, args);
			return;
		}
		
		function downloadimg(kitsune, msg, args) {
			if (!msg.attachments.first().contentType) {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение")
				msg.channel.send({ embeds: [embed] });
				return;	
			};
			if (!msg.attachments.first().contentType.startsWith('image')) {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение")
				msg.channel.send({ embeds: [embed] });
				return;
			};
			const attach = new Discord.AttachmentBuilder(msg.attachments.first().attachment)
			let attachu = ""
			let data
			https.get(attach.attachment, (resp) => { // скачиваем картинку с дискорда сразу в формате base64
				resp.setEncoding('base64');
				resp.on('data', (data) => { attachu += data});
				resp.on('end', () => { // закончили. всё норм
					msg.channel.sendTyping()
					work(kitsune, msg, attachu) // работать
				});
			}).on('error', (e) => {
				console.log(`Got error: ${e.message}`);
			});
		}
		
		function work(kitsune, msg, img) {
			var options = { // параметры обращения к серваку
			  uri: 'https://ai.tu.qq.com/trpc.shadow_cv.ai_processor_cgi.AIProcessorCgi/Process',
			  json: true,
			  body: {
				  busiId: 'ai_painting_anime_img_entry',
				  images: [img] // img - пикча в формате base64. Сайт точно кушает jpg и png
			  }
			};
			
			request.post(options, (err, res, body) => { // обращаемся к серваку
				if (err) {
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(kitsune.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Прозошла ошибка! Наверное китайцы прислали кирпич вместо картинки. Попробуйте ещё раз.")
					msg.channel.send({ embeds: [embed] });
				}
				try {
					let outlink = body.extra
					outlink = outlink.slice(outlink.indexOf('https'), (outlink.indexOf('jpg') + 3) ) // обрезаем до ссылки
					msg.channel.send({content: outlink})
				} catch(err) {
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(kitsune.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Прозошла ошибка! Наверное китайцы прислали кирпич вместо картинки. Попробуйте ещё раз.")
					msg.channel.send({ embeds: [embed] });
				}
			});
		}
    }
}

module.exports = Socialcredit

