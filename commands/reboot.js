const Discord = require("discord.js")
const fs = require("fs")
const { exec } = require("child_process");

class reboot {
    constructor(client, config, commands){
		this.test = "skip"; 
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "Utils";
		this.args = "";
		this.advargs = "<-q> - быстрый березапуск именно бота, а не всей системы\n" +
					   "<-s> - выключение (использовать только в крайнем случае)";
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
			if (args[1] == '-q') {  
				executable_comm = 'pm2 restart all'
			} else if (args[1] == '-s') {
				executable_comm = 'shutdown'
			} else {
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - reboot')
				embed.setColor(`#F00000`)
				embed.setDescription("Неправильные аргументы")
				msg.channel.send({ embeds: [embed] });
			}
		}
		let embed = new Discord.MessageEmbed()
		embed.setTitle(client.user.username + ' - reboot')
		embed.setColor(`#F36B00`)
		if (executable_comm != 'shutdown') {
			embed.setDescription(":arrows_counterclockwise: Перезапуск...")
		} else {
			embed.setDescription(":mobile_phone_off: Выключение...")
		}
		//embed.setFooter({text: 'Executing "' + executable_comm + '"...'})
		msg.channel.send({ embeds: [embed] });
		client.user.setActivity('Пока!');
		client.user.setStatus('idle')
		setTimeout(() => {
			console.log(getTimestamp() + ' [INFO] Logging out of Discord...')
			client.destroy()
		},1500);
		
		setTimeout(() => {
			console.log(getTimestamp() + ' [INFO] Executing "' + executable_comm + '" and closing node process')
			await exec(executable_comm)
			process.exit(0)
		},5000);
	}
}
module.exports = reboot

