const Discord = require("discord.js")
const { createCanvas, loadImage } = require('canvas')
//const bg = '././assets/demotiv/demotivator.png'

const demotivatorImage = async (img, title, width, height) => {
  if (width > 850) {
    height = (height / (width / 850))
	width = 850
  }
  if (width < 100) {
    height = (height / (width / 100))
	width = 100
  }

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  
  //const image = await loadImage(bg)
  //ctx.drawImage(image, 0, 0)
  const avatar = await loadImage(img.attachment)
  ctx.drawImage(avatar, 0, 0, width, height)
  
  let gradient = ctx.createLinearGradient(0, (height - 60), 0, height);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.7)");
  gradient.addColorStop(2, "rgba(0, 0, 0, 0.9)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

	
  ctx.font = '38px Lobster'
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.fillText(title, (width / 2), (height - 17), (width - 8))
  
  
  
  const buffer = canvas.toBuffer('image/png')
  return buffer
}

class Lobster {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = ["AttachFiles"];
		this.args = "<текст>";
		this.advargs = "<текст> - содержарие строки";
		this.argsdesc = this.advargs; // описание аргументов в помоще по конкретной команде
        this.desc = "сделать мем с лобстером как в вк";
		this.advdesc = 'Пикча с текстом, написанным шрифтом "Lobster", что и дает название мема\n\nВывод изображения ограничен в ширину до 850 пикселей';
        this.name = "lobster";
    }

    async run(client, msg, args){
		try {
			//checking attachment availability
			if (!msg.attachments.first()) {
				if (msg.guild) { // if guild
					if (msg.guild.members.me.permissionsIn(msg.channel).has([Discord.PermissionsBitField.Flags.ReadMessageHistory]) && msg.type == "19") { // if reply check reply for attach
						const msgrep = await msg.fetchReference()
						if (msgrep.attachments.first()) {
							work(client, msgrep, args);
							return;
						} else {
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(client.user.username + ' - Error')
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
							work(client, found, args);
							return;
						}
								
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(client.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение")
						msg.reply({ embeds: [embed] });
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
					let embed = new Discord.EmbedBuilder();
					embed.setTitle(client.user.username + ' - Error');
					embed.setColor(`#F00000`);
					embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение");
					msg.reply({ embeds: [embed] });
					return;	
				};
				if (!msg.attachments.first().contentType.startsWith('image')) {
					let embed = new Discord.EmbedBuilder();
					embed.setTitle(client.user.username + ' - Error');
					embed.setColor(`#F00000`);
					embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение");
					msg.reply({ embeds: [embed] });
					return;
				};
				
				args.shift();
				args.push('');
				const data = args.join(' ');
				const attach = new Discord.AttachmentBuilder(msg.attachments.first().attachment);
				msg.channel.sendTyping();
				
				const image = await demotivatorImage(attach, data, msg.attachments.first().width, msg.attachments.first().height);
				msg.reply({files: [image]});
			};
		} catch(err) {
            let embed = new Discord.EmbedBuilder();
			embed.setTitle(client.user.username + ' - Error');
			embed.setColor(`#F00000`);
			embed.setDescription("Ошибка:\n```" + err + "\n```");
			msg.reply({ embeds: [embed] });
		};
    };
};

module.exports = Lobster;

