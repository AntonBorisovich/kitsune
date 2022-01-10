
// WARNING! THIS SCRIPT HAS SPECIFIC PATHS. CHANGING THE PLATFORM OR CHANGING THE LOCATION OF FILES CAN HAVE A BAD EFFECT ON WORKABILITY
// ВНИМАНИЕ! СКРИПТ ИМЕЕТ КОНКРЕТНЫЕ ПУТИ. ИЗМЕНЕНИЕ ПЛАТФОРМЫ ИЛИ СМЕНА МЕСТОПОЛОЖЕНИЯ ФАЙЛОВ МОЖЕТ ПЛОХО СКАЗАТЬСЯ НА РАБОТОСПОСОБНОСТИ

const Discord = require("discord.js")
const { exec } = require("child_process");
const request = require("request")
const util = require('util');
const fs = require("fs")

//cleaning temps
exec("rm /home/pi/senkobot/F_*")
exec("rm /home/pi/senkobot/assets/amogus/temp/*")
exec("rm /home/pi/senkobot/dumpy*")

class Amogus {
    constructor(client, config, commands){
		this.test = true; 
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = ["ATTACH_FILES"];
		this.args = ""; 
		this.category = "Fun";
		this.advargs = "-h <число> - кол во строк (по умолчанию 5, максимум 15)";
		this.usage = "";
        this.desc = "сделать гифку с тверкающим амогусом";
        this.advdesc = "Делает гифку с тверкающими амогусами из вашей фотокарточки\n\n";
        this.name = "amogus";
    }

	async testrun(msg, method) {
		if (method == "manual") {
			if (msg.guild) {
				const permissions = [this.perms];
				const missing = msg.channel.permissionsFor(msg.client.user).missing(permissions);
				if (!missing[0] == "") {
					//console.log(getTimestamp() + "[ERROR] required permissions not found: " + missing.join(', ') + " in channel #" + msg.channel.name + " (" + msg.channel.id + ') in guild "' + msg.guild.name + '" (' + msg.guild.id + ')');
					return "MISSING PERMS (" + missing.join(', ') + ")";
				} else {
					return "OK!"
				}
			}
		} else if (method == "boot") {
			return "OK!"
		}
	}

    async run(client, msg, args){
		try {	
			
			if (!msg.attachments.first()) {
				if (msg.guild) { // if guild
					if (msg.channel.permissionsFor(msg.client.user).missing("READ_MESSAGE_HISTORY") && msg.type == "REPLY" && msg.reference !== null) { // if reply check reply for attach
						const msgrep = await msg.fetchReference()
						if (msgrep.attachments.first()) {
							work(client, msgrep, args);
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
							work(client, found, args);
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
				
				//checking image ratio and size
				if ( (msg.attachments.first().width / msg.attachments.first().height) > 7 || (msg.attachments.first().height / msg.attachments.first().width) > 7 || (msg.attachments.first().size / 1048576) > 8.1) {
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Слишком большое изображение")
					msg.channel.send({ embeds: [embed] });
					return
				}
				
				// WORK
				
				//sending blank
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - amogus')
				embed.setColor(`#F36B00`)
				embed.setDescription("Подождите, операция выполняется")
				const message = await msg.channel.send({ embeds: [embed] });
			
			
				//set session id
				let sessionid = message.id
				msg.channel.sendTyping()
				
				//custom resolution
				let lines = 5
				if (args[1] == '-h' && args[2] != undefined) { 
					lines = parseInt(args[2])
					if (lines > 15) {lines = 15}
					if (lines < 1 ) {lines = 1 }
					if (isNaN(lines)) {lines = 5}
				}

				//downloading attachment
				await request(msg.attachments.first().url).pipe(fs.createWriteStream('assets/amogus/temp/' + sessionid + '.png'))
				
				//magick
				const exec_await = util.promisify(exec);
				function sleep(ms) {
					return new Promise(resolve => setTimeout(resolve, ms));
				}
				await sleep(3300);
				await exec_await("/usr/java/jdk-17.0.1/bin/java -jar /home/pi/senkobot/assets/amogus/amogusdrip.jar --file /home/pi/senkobot/assets/amogus/temp/" + sessionid + ".png --lines " + lines + " --extraoutput " + sessionid);
				
				// END
				
				//sending result
				function getTimestamp() {
					var date = new Date();
					var hours = date.getHours()
					if (hours < 10) {
						hours = "0" + hours
					}
					var mins = date.getMinutes()
					if (mins < 10) {
						mins = "0" + mins
					}
					var seconds = date.getSeconds()
					if (seconds < 10) {
						seconds = "0" + seconds
					}
					var result = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + hours + ":" + mins + ":" + seconds + " "
					return result
				}
				setTimeout(() => {
					message.delete()
					embed = new Discord.MessageEmbed()
					embed.setImage('attachment://dumpy' + sessionid + '.gif')
					embed.setTitle(client.user.username + ' - amogus')
					embed.setColor(`#F36B00`)
					if (!msg.channel.permissionsFor(msg.client.user).missing("READ_MESSAGE_HISTORY")) {
						msg.reply({embeds: [embed], files: ["dumpy" + sessionid + ".gif"] })
					} else {
						msg.channel.send({embeds: [embed], files: ["dumpy" + sessionid + ".gif"] })
					}
					console.log(getTimestamp() + '[INFO] finished and sended ' + sessionid + ' amogus work ordered by ' + msg.author.tag)}
				, 250);
				
				//cleaning temps
				exec("rm /home/pi/senkobot/assets/amogus/temp/" + sessionid + ".png")
				
				setTimeout(() => {exec("rm /home/pi/senkobot/dumpy" + sessionid + ".gif")}, 5000);
				return
			}
		
		} catch(err) {
			let embed = new Discord.MessageEmbed()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("```\n" + err + "\n```")
			msg.channel.send({embeds: [embed]})
			return
		}
    }
	
	
}

module.exports = Amogus

