const Discord = require("discord.js");
const { createCanvas, loadImage } = require('canvas');
const leftpic = 'src/assets/look/left.png';
const rightpic = 'src/assets/look/right.png';

const LookAtThisImage = async (img, width, height) => {

  // downscaling input image
  
  // by height
  if (height > 305) {
	//console.log("before " + width + "x" + height)
    width = Math.floor((width / (height / 305)))
	height = 305
	//console.log("after " + width + "x" + height)
  };
  
  // by width
  if (width > 850) {
	//console.log("before " + width + "x" + height)
    height = Math.floor((height / (width / 850)))
	width = 850
	//console.log("after " + width + "x" + height)
  }
  
  // upscaling if too small
  // TODO
 
  // picture settings
  const canvas = createCanvas((width + 576), 512)
  const ctx = canvas.getContext('2d')
  
  // bg
  ctx.fillStyle = '#fff' // choosing bg color
  ctx.fillRect(0, 0, (width + 576), 512) // drawing bg
  
  // left dude
  const leftpicbuf = await loadImage(leftpic) // loading left dude
  ctx.drawImage(leftpicbuf, 0, 0, 229, 512) // drawing left dude
  
  // pic
  const avatar = await loadImage(img.attachment) // loading user's pic
  ctx.drawImage(avatar, 249 , (150 - height/2), width, height) // drawing user's pic
  
  // right dude
  const rightpicbuf = await loadImage(rightpic) // loading right dude
  ctx.drawImage(rightpicbuf, (269 + width) , 0, 309, 512) // drawing right dude
  
  // sending
  const buffer = canvas.toBuffer('image/png') // setting output format
  return buffer // sending back
}

class Look {
    constructor(kitsune, config, commands, values){
		//задать полученые значения для дальнейшего использования в коде команды
		this.values = values;
        this.kitsune = kitsune;
        this.commands = commands;
		
		//this.twofa = false; // запуск только разработчикам
		this.perms = ["AttachFiles"];
        this.name = "look"; // имя команды
		this.desc = "2 чела показывают на пикчу"; // описание команды в общем списке команд
		this.advdesc = "Делает мем, где 2 нарисованых чела показывают на картинку\nПодробнее: [knowyourmeme.com](https://knowyourmeme.com/memes/two-soyjaks-pointing)"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = "<-w> - растянет вашу картнку в полтора раза (множитель 1.5). <-w=x> - где x - множитель растяжения в ширину (`-w=1.5`, `-w=2`, `-w=0.5`)"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<-w>"; // аргументы в помоще по конкретной команде
    }

    async run(kitsune, msg, args){
		try {
			//checking attachment availability
			if (!msg.attachments.first()) {
				if (msg.guild) { // if guild
					if (msg.guild.members.me.permissionsIn(msg.channel).has([Discord.PermissionsBitField.Flags.ReadMessageHistory]) && msg.type == "19" && msg.reference !== null) { // if reply check reply for attach
						const msgrep = await msg.fetchReference();
						if (msgrep.attachments.first()) {
							await work(kitsune, msgrep, args);
							return;
						} else {
							let embed = new Discord.EmbedBuilder();
							embed.setTitle(kitsune.user.username + ' - Error');
							embed.setColor(`#F00000`);
							embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение");
							msg.channel.send({ embeds: [embed] });
							return;
						};
					} else { // if msg isnt reply check last 10 messages for attach
						let found = "";
						await msg.channel.messages.fetch({ limit: 10 }).then(lastmsgs => {
							//const lastMessage = messages.first();
							//console.log(lastmsgs);
							//console.log(lastMessage.content);
							let lastattachmsg = "";
							
							lastmsgs.forEach(lastmsg => {
								if (lastmsg.attachments.first()) {
									if (found) {return};
									found = lastmsg;
									return;
								}
							});
						});
								
						if (found) {
							await work(kitsune, found, args);
							return;
						};
								
						let embed = new Discord.EmbedBuilder();
						embed.setTitle(kitsune.user.username + ' - Error');
						embed.setColor(`#F00000`);
						embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение");
						msg.channel.send({ embeds: [embed] });
						return;
					};
				};
			} else {
				await work(kitsune, msg, args);
				return;
			};
			
			//work
			async function work(kitsune, msg, args) {
				if (!msg.attachments.first().contentType) {
					let embed = new Discord.EmbedBuilder();
					embed.setTitle(kitsune.user.username + ' - Error');
					embed.setColor(`#F00000`);
					embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение");
					msg.channel.send({ embeds: [embed] });
					return;	
				};
				if (!msg.attachments.first().contentType.startsWith('image')) {
					let embed = new Discord.EmbedBuilder();
					embed.setTitle(kitsune.user.username + ' - Error');
					embed.setColor(`#F00000`);
					embed.setDescription("Изображение не найдено. Прикрепи изображение или ответь на сообщение, которое содержит изображение");
					msg.channel.send({ embeds: [embed] });
					return;
				};
				
				let wide_multiplier = 1;
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
					};
				};
				
				const attach = new Discord.AttachmentBuilder(msg.attachments.first().attachment)
				msg.channel.sendTyping()
				const image = await LookAtThisImage(attach, Math.floor((msg.attachments.first().width * wide_multiplier)), msg.attachments.first().height);
				const imageName = msg.attachments.first().name;
				const finalImage = new Discord.AttachmentBuilder(image, { name: 'look_at_' + imageName.substring(0,imageName.length-4) + '.png' });
				await msg.channel.send({files: [finalImage]})
				return;
			};
		} catch(err) {
			throw(err);
		};
    };
};

module.exports = Look

