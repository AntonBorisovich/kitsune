const Discord = require("discord.js")
const { createCanvas, loadImage } = require('canvas')
//const bg = '././assets/demotiv/demotivator.png'

const demotivatorImage = async (img, title, subtitle, width, height) => {
  if (width > 850) {
	//console.log("before " + width + "x" + height)
    height = Math.floor((height / (width / 850)))
	width = 850
	//console.log("after " + width + "x" + height)
  }

  const canvas = createCanvas((width + 60), (height + 120))
  const ctx = canvas.getContext('2d')
  

  //const image = await loadImage(bg)
  //ctx.drawImage(image, 0, 0)
  ctx.fillRect(0, 0, (width + 60), (height + 120))
  ctx.strokeStyle = '#fff'
  ctx.strokeRect(27, 17, (width + 5), (height + 5))
  const avatar = await loadImage(img.attachment)
  ctx.drawImage(avatar, 29, 19, width, height)

  ctx.font = '42px Times New Roman'
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.fillText(title, ((width + 60) / 2), (height + 65), (width + 53))
  
  ctx.font = '28px Arial'
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.fillText(subtitle, ((width + 60) / 2), (height + 100), (width + 53))
  const buffer = canvas.toBuffer('image/png')
  return buffer
}

class Dem {
    constructor(kitsune, config, commands, customvars){
		//задать полученые значения для дальнейшего использования в коде команды
		this.values = values;
        this.kitsune = kitsune;
        this.commands = commands;
		
		this.root = false; // запуск только разработчикам
		this.perms = ["ATTACH_FILES"];
        this.name = "dem"; // имя команды
		this.desc = "сделать демотиватор"; // описание команды в общем списке команд
		this.advdesc = "Делает демотиватор - изображение, под которым 2 строки текста"; // описание команды в помоще по конкретной команде
		this.args = "<-w> <верхний текст>;<нижний текст>"; // аргументы в общем списке команд
		this.argsdesc = "<верхний текст> и <нижний текст> - содержарие строк, разделяемые `;`\n<-w> - пропишите этот аргумент для искажения избражения. Примеры:\n <-w> - растянет пикчу в полтора раза в ширину\n <-w=0.5> - растянет пикчу в полраза в высоту"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<-w> <верхний текст>;<нижний текст>"; // аргументы в помоще по конкретной команде
    }

    async run(kitsune, msg, args){
		try {
			//checking attachment availability
			if (!msg.attachments.first()) {
				if (msg.guild) { // if guild
					if (msg.channel.permissionsFor(msg.client.user).missing("READ_MESSAGE_HISTORY") && msg.type == "REPLY" && msg.reference !== null) { // if reply check reply for attach
						const msgrep = await msg.fetchReference()
						if (msgrep.attachments.first()) {
							await work(kitsune, msgrep, args);
							return;
						} else {
							let embed = new Discord.MessageEmbed()
							embed.setTitle(kitsune.user.username + ' - Error')
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
							await work(kitsune, found, args);
							return;
						}
								
						let embed = new Discord.MessageEmbed()
						embed.setTitle(kitsune.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение")
						msg.channel.send({ embeds: [embed] });
						return;
					}
				}
			} else {
				await work(kitsune, msg, args);
				return;
			}
			
			//work
			async function work(kitsune, msg, args) {
				if (!msg.attachments.first().contentType) {
					let embed = new Discord.MessageEmbed()
					embed.setTitle(kitsune.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение")
					msg.channel.send({ embeds: [embed] });
					return;	
				}
				if (!msg.attachments.first().contentType.startsWith('image')) {
					let embed = new Discord.MessageEmbed()
					embed.setTitle(kitsune.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение")
					msg.channel.send({ embeds: [embed] });
					return;
				}
				
				let wide_multiplier = 1
				if (args[1]) {
					if (args[1].toLowerCase() == "-w") {
						args.splice(1, 1)
						wide_multiplier = 1.5 
					} else if (args[args.length - 1].toLowerCase() == "-w"){
						args.splice((args.length - 1), 1)
						wide_multiplier = 1.5 
					} else if (args[args.length - 1].toLowerCase().startsWith("-w=")) {
						wide_multiplier = Number(args[args.length - 1].substring(3).replace(/,/g, "."))
						args.splice((args.length - 1), 1)
						if (isNaN(wide_multiplier) || Math.sign(wide_multiplier) < 0 || wide_multiplier == "") {wide_multiplier = 1}
						if (wide_multiplier > 10) {wide_multiplier = 10}
					} else if (args[1].toLowerCase().startsWith("-w=")) {
						wide_multiplier = Number(args[1].substring(3).replace(/,/g, "."))
						args.splice(1, 1)
						if (isNaN(wide_multiplier) || Math.sign(wide_multiplier) < 0 || wide_multiplier == "") {wide_multiplier = 1}
						if (wide_multiplier > 10) {wide_multiplier = 10}
					}
				}
				
				args.shift();
				let data = args.join(' ').split(';');
				data.push("");
				const attach = new Discord.MessageAttachment(msg.attachments.first().attachment)
				msg.channel.sendTyping()
				
				const image = await demotivatorImage(attach, data[0], data[1], Math.floor((msg.attachments.first().width * wide_multiplier)), msg.attachments.first().height)
				await msg.channel.send({files: [image]})
				return;
			}
		} catch(err) {
			throw(err);
		}
    }
}

module.exports = Dem

