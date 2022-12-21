const Discord = require("discord.js")
const GIFEncoder = require('gif-encoder-2')
const { createCanvas, loadImage } = require('canvas')
const arrow = '././assets/giffer/arrows/1.png'

const canvasImage = async (img, width, height, type) => {
  
  if (width > 600) {
    height = (height / (width / 600))
	width = 600
  }
  if (width < 100) {
    height = (height / (width / 100))
	width = 100
  }
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const avatar = await loadImage(img.attachment)
  const encoder = new GIFEncoder(width, height, 'neuquant') //
  //encoder.setDelay(0)
  ctx.drawImage(avatar, 0, 0, width, height)
  var imageData = ctx.getImageData(0,0,width,  height);
  var data = imageData.data;
  for (var i = 0; i < data.length; i += 4) {
      if(data[i] +  data[i+1] +  data[i+2] < 15){ 
		  data[i] = 1;
		  data[i+1] = 1;
          data[i+2] = 1;
      }
  } 
  ctx.putImageData(imageData, 0, 0); 
  
  // drawing half circle
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(width/3, height/9, width/3*2, height/9, width, 0);
  ctx.fill();
  
  // drawing arrow
  ctx.beginPath();
  ctx.moveTo(width/3*1.8, 0);
  ctx.lineTo(width/1.82, height/6);
  ctx.lineTo(width/1.1, 0);
  ctx.fill();
  
  
  // converting to gif
  encoder.start()
  encoder.setTransparent(true)
  encoder.addFrame(ctx)
  encoder.finish()
  
  const buffer = encoder.out.getData()
  //const buffer = canvas.toBuffer('image/png')
  //console.log('converted to png')
  //const codec = new gifwrap.GifCodec();
  return buffer
  
}

class Above {
    constructor(kitsune, commands, values){
        this.values = values;
        this.kitsune = kitsune;
        this.commands = commands;
		this.perms = ["AttachFiles"];
		this.args = "";
		this.advargs = "";
		this.argsdesc = ""; // описание аргументов в помоще по конкретной команде
        this.desc = "сделать гифку типо чел сверху";
		this.advdesc = 'Добавляет на вашу фотокарточку стрелочку и конвертирует пикчу в формат gif. Стрелочка позволяет делать забавные ситуации про пользователя сверху, как бы показывая, о чём он пишет или его реакцию.';
        this.name = "above";
    }

    async run(kitsune, msg, args){
		try {
			//checking attachment availability
			if (!msg.attachments.first()) {
				if (msg.guild) { // if guild
					if (msg.guild.members.me.permissionsIn(msg.channel).has([Discord.PermissionsBitField.Flags.ReadMessageHistory]) && msg.type == "19") { // if reply check reply for attach
						const msgrep = await msg.fetchReference()
						if (msgrep.attachments.first()) {
							work(kitsune, msgrep, args);
							return;
						} else {
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - Error')
							embed.setColor(`#F00000`)
							embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение")
							msg.reply({ embeds: [embed] });
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
							work(kitsune, found, args);
							return;
						}
								
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(kitsune.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение")
						msg.reply({ embeds: [embed] });
						return;
					}
				}
			} else {
				work(kitsune, msg, args);
				return;
			}
			
			//work
			async function work(kitsune, msg, args) {
				
				if (!msg.attachments.first().contentType) {
					let embed = new Discord.EmbedBuilder();
					embed.setTitle(kitsune.user.username + ' - Error');
					embed.setColor(`#F00000`);
					embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение");
					msg.reply({ embeds: [embed] });
					return;	
				};
				if (!msg.attachments.first().contentType.startsWith('image')) {
					let embed = new Discord.EmbedBuilder();
					embed.setTitle(kitsune.user.username + ' - Error');
					embed.setColor(`#F00000`);
					embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение");
					msg.reply({ embeds: [embed] });
					return;
				};
				
				let imgtype = 1
				
				// type 1 - just convert to gif
				// type 2 - convert to gif and add arrow over
				
				if (args[1]) {
					if (args[1].toLowerCase() == "-a") {
						imgtype = 2
					}
				}
				
				const attach = new Discord.AttachmentBuilder(msg.attachments.first().attachment);
				msg.channel.sendTyping();
				try {
					const image = await canvasImage(attach, msg.attachments.first().width, msg.attachments.first().height, imgtype);
					const finalImage = new Discord.AttachmentBuilder(image, { name: msg.id + ".gif" });
					msg.reply({files: [finalImage]});
				} catch(err) {
					let embed = new Discord.EmbedBuilder();
					embed.setTitle(kitsune.user.username + ' - Error');
					embed.setColor(`#F00000`);
					embed.setDescription("Ошибка:\n```" + String(err) + "\n```");
					msg.reply({ embeds: [embed] });
				};
				
			};
		} catch(err) {
            let embed = new Discord.EmbedBuilder();
			embed.setTitle(kitsune.user.username + ' - Error');
			embed.setColor(`#F00000`);
			embed.setDescription("Ошибка:\n```" + err + "\n```");
			msg.reply({ embeds: [embed] });
		};
    };
};

module.exports = Above;

