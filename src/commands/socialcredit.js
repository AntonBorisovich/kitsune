const Discord = require("discord.js")
const request = require("request");
const https = require("https");
const { createCanvas, loadImage } = require('canvas');
const { Buffer } = require('buffer');
const manfile = 'src/assets/china/man.png';

let timeoutidextend = []; // список id пользователей, которые находятся в 20 секундном тайм-ауте

const FryazinoMan = async (img, owidth, oheight) => {
	//console.log('loading...')
	const man = await loadImage(manfile) // loading dude
	//console.log('loaded man')
	const orig = await loadImage(img.attachment)
	//console.log('loaded orig')
	// scaling
	// man.png width  = 330
	// man.png height = 850
	
	//console.log("before " + width + "x" + height)
	const fwidth = Math.floor((310*oheight)/850)
	//console.log("after " + width + "x" + height)
	

	// picture settings
	const canvas = createCanvas(owidth + (fwidth*2), oheight)
	const ctx = canvas.getContext('2d')
	
	// bg
	//ctx.fillStyle = '#fff' // choosing bg color
	//ctx.fillRect(0, 0, (width + 576), 512) // drawing bg
	
	// left man
	
	ctx.drawImage(man, 0, 0, fwidth, oheight) // drawing left dude
	
	// pic
	//const avatar = await loadImage(img.attachment) // loading user's pic
	ctx.drawImage(orig, fwidth, 0, owidth, oheight) // drawing user's pic
	
	// right man
	ctx.drawImage(man, (fwidth + owidth) , 0, fwidth, oheight) // drawing right dude
	
	// sending
	const buffer = canvas.toDataURL('image/png').slice(22) // setting output format
	//console.log(buffer)
	return buffer // sending back
}
class Socialcredit {
	constructor(kitsune, commands, values){
		//задать полученые значения для дальнейшего использования в коде команды
		this.values = values;
        this.kitsune = kitsune;
        this.commands = commands;
		let proxydate = "нету прокси"
		if (values.proxy) {
			proxydate = values.proxy[1]
		}
		//this.twofa = false; // запуск только разработчикам
		this.perms = ["AttachFiles"];
        this.name = "china"; // имя команды
		this.desc = "аниме-фильтр"; // описание команды в общем списке команд
		this.advdesc =  "Преобразует вашу фотокарточку с помощью нейронных сетей, и в итоге будто кадр из аниме.\n" +
						"Поддерживаются форматы png и jpeg. Цензуру не проходят нагота и политика.\n\n"+
						"C 3 декабря нейронка больше не принимает фотки без лиц людей\n" +
						"C 5 декабря нейронка больше не работает за пределами китая (наверное?)\n\n" +
						"**Прокси для этой команды будет работать до: " + proxydate + "**\n" +
						"Оригинальный сайт: https://h5.tu.qq.com/web/ai-2d/cartoon/index"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = "<-f> - добавляет свидетеля из фрязина по бокам картинки, что бы обмануть нейронку и заставить её обработать картинку без человеческих лиц"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<-f>"; // аргументы в помоще по конкретной команде
    }
	
	

    async run(kitsune, msg, args){
		if (timeoutidextend.indexOf(msg.author.id) != -1) { // проверяем в тайм-ауте ли пользователь
			let embed = new Discord.EmbedBuilder()
			embed.setTitle(kitsune.user.username + ' - Cooldown')
			embed.setColor(`#F00000`)
			embed.setDescription("Погоди немного, чаще чем 20 секунд нельзя.")
			msg.reply({ embeds: [embed] });
			return;
		}; 
		timeoutidextend.push(msg.author.id); // добавляем пользователя в тайм-аут
		setTimeout(() => { // через 20 секунд снимаем пользователя с тайм-аута
			const index = timeoutidextend.indexOf(msg.author.id); // чекаем есть ли id в тайм-ауте
			if (index !== -1) { timeoutidextend.splice(index, 1) }; // удаляем из тайм-аута
		}, 20000);
		
		if (!msg.attachments.first()) {
			if (msg.guild) { // if guild
				if (msg.guild.members.me.permissionsIn(msg.channel).has([Discord.PermissionsBitField.Flags.ReadMessageHistory]) && msg.type == "19" && msg.reference !== null) { // if reply check reply for attach
					const msgrep = await msg.fetchReference()
					if (msgrep.attachments.first()) {
						await downloadimg(kitsune, msgrep, args, this.values.proxy);
						return;
					} else {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(kitsune.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение.")
						msg.reply({ embeds: [embed] });
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
						await downloadimg(kitsune, found, args, this.values.proxy);
						return;
					}
							
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(kitsune.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение.")
					msg.reply({ embeds: [embed] });
					return;
				}
			}
		} else {
			await downloadimg(kitsune, msg, args, this.values.proxy);
			return;
		}
		
		async function downloadimg(kitsune, msg, args, proxy) {
			if (!msg.attachments.first().contentType) {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение.")
				msg.reply({ embeds: [embed] });
				return;	
			};
			if (!msg.attachments.first().contentType.startsWith('image')) {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение.")
				msg.reply({ embeds: [embed] });
				return;
			};
			const attach = new Discord.AttachmentBuilder(msg.attachments.first().attachment)
			msg.channel.sendTyping()
			if (args[1] != "-f") {
				let attachu = ""
				let data
				https.get(attach.attachment, resp => { // скачиваем картинку с дискорда сразу в формате base64
					resp.setEncoding('base64');
					resp.on('data', (data) => { attachu += data});
					resp.on('end', () => { // закончили. всё норм
						work(kitsune, msg, attachu, proxy) // работать
					});
				}).on('error', (e) => {
					console.log(`Got error while downloading image from discord: ${e.message}`);
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(kitsune.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Не удалось загрузить изображение. Попробуйте ещё раз.")
					msg.reply({ embeds: [embed] });
					return;
				});
			} else {
				//attachu = Buffer.from(attachu, 'base64');
				const fixedimg = await FryazinoMan(attach, msg.attachments.first().width, msg.attachments.first().height)
				
				work(kitsune, msg, fixedimg, proxy) // работать
				return;
			}
		}
		
		function work(kitsune, msg, img, proxy) {
			var options
			if (proxy) {
				options = { // параметры обращения к серваку
				  uri: 'https://ai.tu.qq.com/trpc.shadow_cv.ai_processor_cgi.AIProcessorCgi/Process',
				  proxy: 'http://' + proxy[0],
				  json: true,
				  body: {
					  busiId: 'ai_painting_anime_img_entry',
					  images: [img] // img - пикча в формате base64. Сайт точно кушает jpg и png
				  }
				};
			} else {
				options = { // параметры обращения к серваку
				  uri: 'https://ai.tu.qq.com/trpc.shadow_cv.ai_processor_cgi.AIProcessorCgi/Process',
				  json: true,
				  body: {
					  busiId: 'ai_painting_anime_img_entry',
					  images: [img] // img - пикча в формате base64. Сайт точно кушает jpg и png
				  }
				};
			}
				
			request.post(options, (err, res, body) => { // обращаемся к серваку
				//console.log(res);
				if (err) {
					console.log(err)
					if (body) {
						if (body.msg) {
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Прозошла ошибка! Наверное, китайцы прислали кирпич вместо картинки. Попробуйте ещё раз.")
							embed.setFooter({ text: body.code + " " + body.msg })
							msg.reply({ embeds: [embed] });
							return;
						} else {
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Прозошла ошибка! Наверное, китайцы прислали кирпич вместо картинки. Попробуйте ещё раз.")
							embed.setFooter({ text: String(err) })
							msg.reply({ embeds: [embed] });
							return;
						}
					} else {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(kitsune.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Прозошла ошибка! Наверное, китайцы прислали кирпич вместо картинки. Попробуйте ещё раз.")
						embed.setFooter({ text: String(err) })
						msg.reply({ embeds: [embed] });
						return;
					}
				}
				try {
					let outlink = body.extra
					outlink = outlink.slice(outlink.indexOf('https'), (outlink.indexOf('jpg') + 3) ) // обрезаем до ссылки
					msg.reply({content: outlink})
				} catch(err) {
					
					// known codes
					
					// code  - description (message from server)
					// 0     - Work done, no errors ()
					// 1     - Internal decoding failure ()
					// -2100 - Wrong format (PARAM_INVALID)
					// 1001  - No face in image (b'no face in img')
					// 2111  - Too often? (VOLUMN_LIMIT)
					// 2114  - NSFW, politics (IMG_ILLEGAL)
					// 2119  - Blocked region (user_ip_country <country>)
					
					if (body.msg && body.code) {
						if (body.code == 1 || body.code == -2100 || body.msg == 'PARAM_INVALID') {
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Фотка не подошла по формату. Иногда помогает сделать скриншот и отправить его вместо оригинала.")
							embed.setFooter({ text: body.code + " " + body.msg })
							msg.reply({ embeds: [embed] });
						} else if (body.code == 2114 || body.msg == 'IMG_ILLEGAL') {
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Запрещённая фотка. По неизвестным причинам содержание этой фотки не прошла проверку китайской цензуры.")
							embed.setFooter({ text: body.code + " " + body.msg })
							msg.reply({ embeds: [embed] });
						} else if (body.code == 2111 || body.msg == 'VOLUMN_LIMIT') {
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Произошла ошибка! Наверное, недавно было слишком много одинаковых запросов.")
							embed.setFooter({ text: body.code + " " + body.msg })
							msg.reply({ embeds: [embed] });
						} else if (body.code == 2119 || body.msg.startsWith('user_ip_country')) {
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - Error')
							embed.setColor(`#F00000`)
							if (proxy) {
								embed.setDescription("Регион заблокирован. У бота неправильно настроен прокси сервер или прокси сервер не отвечает.")
							} else {
								embed.setDescription("Регион заблокирован. У бота не задан прокси сервер.")
							}
							embed.setFooter({ text: body.code + " " + body.msg })
							msg.reply({ embeds: [embed] });
						} else if (body.code == 1001 || body.msg == "b'no face in img'") {
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Лицо не обнаружено. Нейронка не принимает картинки без человеческих лиц, но вы можете попробовать использовать аргумент `-f` для обмана нейросетки. Просто напишите `china -f` и попробуйте снова!")
							embed.setFooter({ text: body.code + " " + body.msg })
							msg.reply({ embeds: [embed] });
						} else {
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Произошла ошибка! Наверное, китайцы прислали кирпич вместо результата. Попробуйте ещё раз.")
							embed.setFooter({ text: body.code + " " + body.msg })
							msg.reply({ embeds: [embed] });
						}
					}
				}
			});
		}
    }
}

module.exports = Socialcredit

