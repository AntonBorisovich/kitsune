const Discord = require("discord.js")
const fs = require("fs")
const { exec } = require("child_process");

class reboot {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
		this.test = "skip"; 
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "Utils";
		this.args = "";
		this.advargs = "<-q> - быстрый березапуск именно бота, а не всей системы\n" +
					   "<-s> - выключение (использовать только в крайнем случае)\n" +
					   "<-m> - переключение режима тех. обслуживания + быстрый перезапуск";
		this.usage = "";
        this.desc = "перезапуск бота hide";
        this.advdesc = "Полный перезапуск бота\n\n**Доступна только основателю!**";
        this.name = "reboot";
    }

    run(client, msg, args){
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
			var result = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + hours + ":" + mins + ":" + seconds
			return result
		}
		let executable_comm = 'reboot'
		if (args[1]) {
			if (args[1].toLowerCase() == '-q') {  
				executable_comm = 'pm2 restart all'
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - reboot')
				embed.setColor(`#F36B00`)
				embed.setDescription(":arrows_counterclockwise: Перезапуск...")
				msg.channel.send({ embeds: [embed] });
				work(client)
			} else if (args[1].toLowerCase() == '-s') {
				executable_comm = 'pm2 stop all'
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - reboot')
				embed.setColor(`#F36B00`)
				embed.setDescription(":mobile_phone_off: Выключение...")
				msg.channel.send({ embeds: [embed] });
				work(client)
			} else if (args[1].toLowerCase() == '-m') {
				executable_comm = 'pm2 restart all'
				fs.writeFile('././values/maintenance.json', '{"maintenance": ' + !this.customvars.maintenance + '}', (err) => {
				  if (err) {
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("```\n" + err + "\n```")
					msg.channel.send({ embeds: [embed] });
					return
					console.error(err)
					return
				  }
				})
				console.log(getTimestamp() + ' [INFO] Changed value. maintenance = ' + !this.customvars.maintenance)
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - reboot')
				embed.setColor(`#F36B00`)
				if (this.customvars.maintenance) {
					embed.setDescription(":white_check_mark: Перезапуск и выход в нормальную работу...")
				} else {
					embed.setDescription(":tools: Перезапуск в режиме тех. обслуживания...")
				}
				msg.channel.send({ embeds: [embed] });
				work(client)
			} else {
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Неправильные аргументы")
				msg.channel.send({ embeds: [embed] });
				return
			}
		}
		function work(client) {
			client.user.setActivity('Пока!');
			client.user.setStatus('idle')
			setTimeout(() => {
				console.log(getTimestamp() + ' [INFO] Logging out of Discord...')
				client.destroy()
			},3000);
			
			setTimeout(() => {
				console.log(getTimestamp() + ' [INFO] Executing "' + executable_comm + '" and closing node process')
				exec(executable_comm)
				process.exit(0)
			},6000);
		}
	}
}
module.exports = reboot

