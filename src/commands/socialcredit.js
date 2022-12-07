// TODO
//
// parsing "Process" request and requesting it through "https" module but chromium
// Blocking "speed" and "upload v2" requests if they did not effect on workability
// Opening new tab in alredy launched browser instead of launching new every time
// Sending "Loading..." message for user while image is processing and then edit that message with result
// 

const Discord = require("discord.js")
//const request = require("request");
const https = require("https");
const { createCanvas, loadImage } = require('canvas');
//const { Buffer } = require('buffer');
const manfile = 'src/assets/china/man.png';
const puppeteer = require('puppeteer');
const fs = require("fs");

let timeoutidextend = []; // список id пользователей, которые находятся в 20 секундном тайм-ауте
let workingon = []; // список id пользователей, пикчи которых обрабатываются

let browseractive = false

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
	//const buffer = canvas.toDataURL('image/png').slice(22) // setting output format
	//const buffer = canvas.toBuffer('image/png') // setting output format
	//console.log(buffer)
	
	//let stream = canvas.pngStream();
	//stream.on('data', function(chunk){
	//  fs.createWriteStream('src/assets/china/temp/' + name + '.png').write(chunk);
	//});
	
	//const buffer = await canvas.toBuffer('image/jpeg')
	//await fs.writeFileSync('src/assets/china/temp/' + name + '.jpg', buffer)
	const buffer = await canvas.toBuffer("image/png");
	await fs.writeFileSync('src/assets/china/temp/' + name + '.png', buffer);
	return 'src/assets/china/temp/' + name + '.png'
	
	
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
						"C 5 декабря нейронка больше не работает за пределами китая (наверное?)\n" +
						"C 6 декабря нейронка требует неизвестный токен, что замедляет получение картинки т.к. с этого момента бот скачивает картинку не напрямую, а через виртуальный браузер\n\n" +
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
		
		if (browseractive) { // проверяем включен ли уже браузер
			let embed = new Discord.EmbedBuilder()
			embed.setTitle(kitsune.user.username + ' - браузер хочет оперативу')
			embed.setColor(`#F00000`)
			embed.setDescription("Кто-то уже обрабатывает картинку. Мы ещё не умеем обрабатывать одновременно несколько картинок. Подождите немного и попробуйте снова.")
			msg.reply({ embeds: [embed] });
			return;
		}; 
		
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
			if (args[1] != "-f") { // если обычная работа
				let attachu = ""
				let data
				https.get(attach.attachment, resp => { // скачиваем картинку с дискорда
					resp.setEncoding('base64');
					resp.on('data', (data) => { attachu += data});
					resp.on('end', async () => { // закончили. всё норм
					    
						await fs.writeFileSync('src/assets/china/temp/' + msg.id + ".png", attachu, 'base64') // пишем во временный файл
						work(kitsune, msg, 'src/assets/china/temp/' + msg.id + ".png", proxy)
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
				
				
			} else { // если надо добавить свидетеля по бокам
				//attachu = Buffer.from(attachu, 'base64');
				const fixedimg = await FryazinoMan(attach, msg.attachments.first().width, msg.attachments.first().height, msg.id) // добавить чудика
				
				work(kitsune, msg, fixedimg, proxy) // работать
				return;
			}
		}
		
		async function work(kitsune, msg, img, proxy) {
			// var options
			// if (false) {
				// options = { // параметры обращения к серваку
				  // uri: 'https://ai.tu.qq.com/trpc.shadow_cv.ai_processor_cgi.AIProcessorCgi/Process',
				  // proxy: 'http://' + proxy[0],
				  // json: true,
				  // headers: {
					// "Accept": "application/json, text/plain, */*",
					// "Accept-Encoding": "gzip, deflate, br",
					// "Accept-Language": "en-US;q=0.9,ja;q=0.8",
					// "Origin": "https://h5.tu.qq.com",
					// "Referer": "https://h5.tu.qq.com/",
					// "Sec-Fetch-Dest": "empty",
					// "Sec-Fetch-Mode": "cors",
					// "Sec-Fetch-Site": "same-site",
					// "sec-ch-ua": '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
					// "sec-ch-ua-mobile": "?0",
					// "sec-ch-ua-platform": "Windows",
					// "x-sign-value": "3c8c1d787ce8f3ab8843aad168c1543e",
					// "x-sign-version": "v1"
				  // },
				  // body: {
					  // busiId: 'ai_painting_anime_img_entry',
					  // images: [img] // img - пикча в формате base64. Сайт точно кушает jpg и png
				  // }
				// };
			// } else {
			
				// options = {
				  // uri: 'https://otheve.beacon.qq.com/analytics/v2_upload?appkey=0WEB02VMLD4EVVMN',
				  // proxy: 'http://' + proxy[0],
				  // json: true,
				  // "headers": {
					// "accept": "application/json, text/plain, */*",
					// "accept-language": "ru,en;q=0.9,ru-RU;q=0.8,en-US;q=0.7,ja;q=0.6",
					// "cache-control": "max-age=0",
					// "content-type": "application/json;charset=utf-8",
					// "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
					// "sec-ch-ua-mobile": "?0",
					// "sec-ch-ua-platform": "\"Windows\"",
					// "sec-fetch-dest": "empty",
					// "sec-fetch-mode": "cors",
					// "sec-fetch-site": "same-site",
					// "Referer": "https://h5.tu.qq.com/",
					// "Referrer-Policy": "strict-origin-when-cross-origin"
				  // },
				  // "body": "{\"appVersion\":\"0.0.1\",\"sdkId\":\"js\",\"sdkVersion\":\"4.4.1-web\",\"mainAppKey\":\"0WEB02VMLD4EVVMN\",\"platformId\":3,\"common\":{\"A2\":\"xD1kfNBPxPT74jWtts0x9xyk8by0QsWP\",\"A8\":\"\",\"A12\":\"ru\",\"A17\":\"1920*1080*1\",\"A23\":\"\",\"A50\":\"\",\"A76\":\"0WEB02VMLD4EVVMN_1670335009214\",\"A101\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36\",\"A102\":\"https://h5.tu.qq.com/web/ai-2d/cartoon/index\",\"A104\":\"\",\"A119\":\"\"},\"events\":[{\"eventCode\":\"btn_click\",\"eventTime\":\"1670337044513\",\"mapValue\":{\"source\":\"link\",\"level\":\"0\",\"activity_id\":\"cartoon\",\"page_id\":\"index\",\"btn_id\":\"api:ai_painting_anime_entry\",\"platform_name\":\"PC\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36\",\"trace_id\":\"83c70e11-df8d-c9f2-07fc-17ad1e7f3c76\",\"parent_trace_id\":\"83c70e11-df8d-c9f2-07fc-17ad1e7f3c76\",\"A99\":\"Y\",\"A100\":\"36\",\"A72\":\"4.4.1-web\",\"A88\":\"1670332010992\"}}]}",
				  // "method": "POST"
				// };
			// }
			try {
				let finalimage
				let finalvideo
				
				browseractive = true
				workingon.push(msg.id)
				
				//console.log('launching browser...')
				const browser = await puppeteer.launch({
					headless: true,
					slowMo: 0,
					args: [ '--proxy-server=' + proxy[0] ]
				});
				//console.log('launched browser')
				
				//console.log('opening new tab...')
				const page = await browser.newPage();
				//console.log('opened new tab')
				
				//console.log('auth...')
				await page.authenticate({username:proxy[2], password:proxy[3]});
				//console.log('auth done')
				
				
				//console.log('disabling images...')
				await page.setRequestInterception(true);
				page.on('request', (req) => {
					if (req.resourceType() == 'font' || req.resourceType() == 'image' || req.url().endsWith('.mp4')) {
						//console.log(req.url())
						if (req.url() == "https://shadow-h5-prd-1251316161.file.myqcloud.com/oss/1/playBtn.png" || req.url().startsWith('data')) {
							req.continue();
						} else if (req.url().startsWith('https://activity.tu.qq.com/mqq/ai_painting_anime/share/')) {
							finalimage = req.url()
							req.abort();
							if (finalvideo) {
								post(kitsune, msg, finalimage, finalvideo)
							}
						} else if (req.url().endsWith('.mp4')) {
							if (!finalvideo) {
								finalvideo = req.url()
								videodone(kitsune, msg, finalvideo)
							}
							req.abort();
						} else {
							req.abort();
						}
					} else {
						//console.log('YES - ' + req.url())
						req.continue();
					}
				});
				//console.log('images disabled')
				
				//console.log('opening page in tab...')
				await page.goto('https://h5.tu.qq.com/web/ai-2d/cartoon/index');
				//console.log('opened page in tab')
				
				//console.log('waiting 3 seconds...')
				//await page.waitFor(3000)
					
				//console.log('clicking on license button...')
				await page.waitForSelector('#page-container > div > div._modal_f95ly_1 > div > div > div._confirm-btn_1fu81_42')
				await page.click('#page-container > div > div._modal_f95ly_1 > div > div > div._confirm-btn_1fu81_42');
				//console.log('clicked on license button')
				
				//console.log('clicking on play button...')
				await page.click('#index-play-btn');
				//console.log('clicked on play button')
				
				setTimeout( async () => { // 
					workingon.forEach(async id => {
						if (id == msg.id) { 
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription('Ответа нет уже почти минуту, мы закрыли браузер. Попробуйте ещё раз')
							msg.reply({ embeds: [embed] });
							browseractive = false;
							await browser.close()
						}; 
					});
				}, 35000);
				
				//console.log('waiting for file chooser')
				//console.log(img)
				const [fileChooser] = await Promise.all([
					page.waitForFileChooser('#page-container > div > div._modal_f95ly_1 > div > div > div > img'),
					//console.log('clicking on choose photo button...'),
					page.click('#page-container > div > div._modal_f95ly_1 > div > div > div > img')
					//console.log('clicked on choose photo button')
				]);
				
				
				
				await fileChooser.accept([img]);
				
				
				
				
				// когда скачали видос
				async function videodone(kitsune, msg, finalvideo) {
					fs.unlink('src/assets/china/temp/' + msg.id + ".png", (err => {
						if (err) console.log(err);
					})); // удалить временный файл
					await page.click('#page-view > div._olympic-result-page_mvguu_1 > div._result-page_mvguu_93 > div._action-panel_mvguu_144 > div._action-btn-group_mvguu_149 > img');
					//console.log('clicked on save pic button')
					return;
				}
				async function post(kitsune, msg, finalimage, finalvideo) {
					await browser.close()
					browseractive = false
					
					const index = workingon.indexOf(msg.id);
					if (index !== -1) { workingon.splice(index, 1) };
					
					msg.reply({ content: 'фотка: ' + finalimage + '\nвидос: ' + finalvideo });
					return;
				}
				
			} catch(err) {
				console.log(err);
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Произошла ошибка! Мы ещё не умеем сообщать, что именно пошло не так.")
				embed.setFooter({ text: err.name })
				
				browseractive = false
					
				const index = workingon.indexOf(msg.id);
				if (index !== -1) { workingon.splice(index, 1) };
				
				msg.reply({ embeds: [embed] });
				// known codes
				
				// code  - description (message from server)
				// 0     - Work done, no errors ()
				// 1     - Internal decoding failure ()
				// -2111 - auth error (AUTH_FAILED)
				// -2100 - Wrong format (PARAM_INVALID)
				// 1001  - No face in image (b'no face in img')
				// 2111  - Too often? (VOLUMN_LIMIT)
				// 2114  - NSFW, politics (IMG_ILLEGAL)
				// 2119  - Blocked region (user_ip_country <country>)
				
				// if (body.msg && body.code) {
					// if (body.code == 1 || body.code == -2100 || body.msg == 'PARAM_INVALID') {
						// let embed = new Discord.EmbedBuilder()
						// embed.setTitle(kitsune.user.username + ' - Error')
						// embed.setColor(`#F00000`)
						// embed.setDescription("Фотка не подошла по формату. Иногда помогает сделать скриншот и отправить его вместо оригинала.")
						// embed.setFooter({ text: body.code + " " + body.msg })
						// msg.reply({ embeds: [embed] });
					// } else if (body.code == 1 || body.code == -2111 || body.msg == 'AUTH_FAILED') {
						// let embed = new Discord.EmbedBuilder()
						// embed.setTitle(kitsune.user.username + ' - Error')
						// embed.setColor(`#F00000`)
						// embed.setDescription("Ошибка входа. Китайцы опять что-то намудрили. Скоро исправим!")
						// embed.setFooter({ text: body.code + " " + body.msg })
						// msg.reply({ embeds: [embed] });
					// } else if (body.code == 2114 || body.msg == 'IMG_ILLEGAL') {
						// let embed = new Discord.EmbedBuilder()
						// embed.setTitle(kitsune.user.username + ' - Error')
						// embed.setColor(`#F00000`)
						// embed.setDescription("Запрещённая фотка. По неизвестным причинам содержание этой фотки не прошла проверку китайской цензуры.")
						// embed.setFooter({ text: body.code + " " + body.msg })
						// msg.reply({ embeds: [embed] });
					// } else if (body.code == 2111 || body.msg == 'VOLUMN_LIMIT') {
						// let embed = new Discord.EmbedBuilder()
						// embed.setTitle(kitsune.user.username + ' - Error')
						// embed.setColor(`#F00000`)
						// embed.setDescription("Произошла ошибка! Наверное, недавно было слишком много одинаковых запросов.")
						// embed.setFooter({ text: body.code + " " + body.msg })
						// msg.reply({ embeds: [embed] });
					// } else if (body.code == 2119 || body.msg.startsWith('user_ip_country')) {
						// let embed = new Discord.EmbedBuilder()
						// embed.setTitle(kitsune.user.username + ' - Error')
						// embed.setColor(`#F00000`)
						// if (proxy) {
							// embed.setDescription("Регион заблокирован. У бота неправильно настроен прокси сервер или прокси сервер не отвечает.")
						// } else {
							// embed.setDescription("Регион заблокирован. У бота не задан прокси сервер.")
						// }
						// embed.setFooter({ text: body.code + " " + body.msg })
						// msg.reply({ embeds: [embed] });
					// } else if (body.code == 1001 || body.msg == "b'no face in img'") {
						// let embed = new Discord.EmbedBuilder()
						// embed.setTitle(kitsune.user.username + ' - Error')
						// embed.setColor(`#F00000`)
						// embed.setDescription("Лицо не обнаружено. Нейронка не принимает картинки без человеческих лиц, но вы можете попробовать использовать аргумент `-f` для обмана нейросетки. Просто напишите `china -f` и попробуйте снова!")
						// embed.setFooter({ text: body.code + " " + body.msg })
						// msg.reply({ embeds: [embed] });
					// } else {
						// let embed = new Discord.EmbedBuilder()
						// embed.setTitle(kitsune.user.username + ' - Error')
						// embed.setColor(`#F00000`)
						// embed.setDescription("Произошла ошибка! Наверное, китайцы прислали кирпич вместо результата. Попробуйте ещё раз.")
						// embed.setFooter({ text: body.code + " " + body.msg })
						// msg.reply({ embeds: [embed] });
					// }
				// }
			}
		}
    }
}

module.exports = Socialcredit

