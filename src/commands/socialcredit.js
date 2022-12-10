const Discord = require("discord.js")
const request = require("request");
const https = require("https");
const { createCanvas, loadImage } = require('canvas');
//const { Buffer } = require('buffer');
const manfile = 'src/assets/china/man.png';
//const puppeteer = require('puppeteer');
//const fs = require("fs");
const md5 = require('md5');
//const uuid4 = require('uuid4');
const os = require('os'); // получение данных о системе для генерации useragent

let timeoutidextend = []; // список id пользователей, которые находятся в 20 секундном тайм-ауте

let useragent = "Mozilla/5.0 (X11; Linux x86_64; rv:106.0) Gecko/20100101 Firefox/106.0" // defualt agent
if (os.platform().startsWith('win')){
	useragent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
} else if (os.platform().startsWith('linux')) {
	useragent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chromium/108.0.0.0 Safari/537.36"
}

const FryazinoMan = async (img, owidth, oheight, name) => {
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
	//const buffer = canvas.toBuffer('image/png') // setting output format
	//console.log(buffer)
	
	//let stream = canvas.pngStream();
	//stream.on('data', function(chunk){
	//  fs.createWriteStream('src/assets/china/temp/' + name + '.png').write(chunk);
	//});
	
	//const buffer = await canvas.toBuffer('image/jpeg')
	//await fs.writeFileSync('src/assets/china/temp/' + name + '.jpg', buffer)
	//const buffer = await canvas.toBuffer("image/png");
	//await fs.writeFileSync('src/assets/china/temp/' + name + '.png', buffer);
	return buffer
	
	
	//return buffer // sending back
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
		this.perms = [];
        this.name = "china"; // имя команды
		this.desc = "аниме-фильтр"; // описание команды в общем списке команд
		this.advdesc =  "Преобразует вашу фотокарточку с помощью нейронных сетей, и в итоге будто кадр из аниме.\n" +
						"Поддерживаются форматы png и jpeg. Цензуру не проходят нагота и политика.\n\n"+
						"C 3 декабря нейронка больше не принимает фотки без лиц людей\n" +
						"C 5 декабря нейронка больше не работает за пределами китая (бот обходит это правило через прокси)\n\n" +
						"**Прокси для этой команды будет работать до: " + proxydate + "**\n\n" +
						"Автор документации API: https://github.com/David-Lor/python-qqddm\n" +
						"Оригинальный сайт нейронки: https://h5.tu.qq.com/web/ai-2d/cartoon/index"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = "<-f> - добавляет свидетеля из фрязина по бокам картинки, что бы обмануть нейронку и заставить её обработать картинку без человеческих лиц\n" +
						"<-h> - как разделять картинку. Если будет `-h`, то картинка разделится по горизонтале, а если без аргумента, то по вертикали"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<-f> <-h>"; // аргументы в помоще по конкретной команде
    }
	
	

    async run(kitsune, msg, args){	
		const originalmsg = msg
		if (timeoutidextend.indexOf(msg.author.id) != -1) { // проверяем в тайм-ауте ли пользователь
			let embed = new Discord.EmbedBuilder()
			embed.setTitle(kitsune.user.username + ' - Cooldown')
			embed.setColor(`#F00000`)
			embed.setDescription("Погоди немного, чаще чем 20 секунд нельзя.")
			originalmsg.reply({ embeds: [embed] });
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
						await downloadimg(kitsune, msgrep, originalmsg, args, this.values.proxy);
						return;
					} else {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(kitsune.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение.")
						originalmsg.reply({ embeds: [embed] });
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
						await downloadimg(kitsune, found, originalmsg, args, this.values.proxy);
						return;
					}
							
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(kitsune.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение.")
					originalmsg.reply({ embeds: [embed] });
					return;
				}
			}
		} else {
			await downloadimg(kitsune, msg, originalmsg, args, this.values.proxy);
			return;
		}
		
		async function downloadimg(kitsune, msg, originalmsg, args, proxy) {
			if (!msg.attachments.first().contentType) {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение.")
				originalmsg.reply({ embeds: [embed] });
				return;	
			};
			if (!msg.attachments.first().contentType.startsWith('image')) {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение.")
				originalmsg.reply({ embeds: [embed] });
				return;
			};
			const attach = new Discord.AttachmentBuilder(msg.attachments.first().attachment)
			msg.channel.sendTyping()
			if (args[1] != "-f" || args[2] != "-f" || args[1] != "-F" || args[2] != "-F") { // если обычная работа
				let attachu = ""
				let data
				https.get(attach.attachment, resp => { // скачиваем картинку с дискорда
					resp.setEncoding('base64');
					resp.on('data', (data) => { attachu += data});
					resp.on('end', async () => { // закончили. всё норм
					    
						//await fs.writeFileSync('src/assets/china/temp/' + msg.id + ".png", attachu, 'base64') // пишем во временный файл
						work(kitsune, originalmsg, attachu, proxy, args)
					});
				}).on('error', (e) => {
					console.log(`Got error while downloading image from discord: ${e.message}`);
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(kitsune.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Не удалось загрузить изображение. Попробуйте ещё раз.")
					originalmsg.reply({ embeds: [embed] });
					return;
				});	
			} else { // если надо добавить свидетеля по бокам
				//attachu = Buffer.from(attachu, 'base64');
				const fixedimg = await FryazinoMan(attach, msg.attachments.first().width, msg.attachments.first().height, msg.id) // добавить чудика
				
				work(kitsune, originalmsg, fixedimg, proxy, args) // работать
				return;
			}
		}
		
		async function work(kitsune, msg, img, proxy, args) {	
			var picver = 1 // vertical result
			if (args[1] != "-h" || args[2] != "-h" || args[1] != "-H" || args[2] != "-H") {  // if user need horizontal image
				picver = 2 // horizontal result
			}

			const reqbody = '{"busiId":"ai_painting_anime_img_entry","images":["' + img + '"],"extra":"{\\"face_rects\\":[],\\"version\\":' + picver + ',\\"platform\\":\\"web\\",\\"root_channel\\":\\"\\",\\"level\\":1}"}'
			//console.log(reqbody);
			//return;
			
			const signkey = md5('https://h5.tu.qq.com' + reqbody.length + 'HQ31X02e') // чёрная магия с получением ключа (хэша)

			const options = { // параметры обращения к серваку
			  uri: 'https://ai.tu.qq.com/trpc.shadow_cv.ai_processor_cgi.AIProcessorCgi/Process',
			  proxy: 'http://' + proxy[2] + ':' + proxy[3] + '@' + proxy[0],
			  json: true,
			  headers: {
				"Origin": "https://h5.tu.qq.com",
				"Referer": "https://h5.tu.qq.com/",
				"x-sign-value": signkey, // generated key
				"x-sign-version": "v1",
				//"User-Agent": useragent // it's not really needed, but just in case
			  },
			  body: {
				busiId: "ai_painting_anime_img_entry",
				images: [img],
				extra: '{\"face_rects\":[],\"version\":' + picver + ',\"platform\":\"web\",\"root_channel\":\"\",\"level\":1}'
			  }
			};
			request.post(options, (err, res, body) => { // обращаемся к серваку
				//if (res) {
				//	console.log(res);
				//}
				if (err) {
					//console.log(err);
					//console.log(body);
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
					return;
				}
				try {
					let outlink = body.extra
					//console.log(body)
					outlink = outlink.slice(outlink.indexOf('https'), (outlink.indexOf('jpg') + 3) ) // обрезаем до ссылки
					msg.reply({content: outlink})
				} catch(err) {
					
					// known codes
					
					// code  - description (message from server)
					// 0     - Work done, no errors ()
					// 1     - Internal decoding failure ()
					// -2111 - wrong x-sign-value (AUTH_FAILED)
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
						} else if (body.code == 1 || body.code == -2111 || body.msg == 'AUTH_FAILED') {
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Ошибка входа. Тут вы ничего не сможете исправить, только ждать исправления от автора бота.")
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
							embed.setDescription("Произошла ошибка! Наверное, недавно было слишком много запросов или ваша фотокарточка слишком большая. Попробуйте сделать скриншот и попробовать ещё раз.")
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

