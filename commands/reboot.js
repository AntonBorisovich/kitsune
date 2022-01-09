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
		this.advargs = "<-q> - быстрый березапуск именно бота, а не всей системы";
		this.usage = "";
        this.desc = "перезапуск бота hide";
        this.advdesc = "Полный перезапуск бота\n\n**Доступна только основателю!**";
        this.name = "reboot";
    }

    run(client, msg, args){
		let executable_comm = 'reboot'
		if (args[1]) {
			if (args[1] == '-q') {  
				executable_comm = 'pm2 restart all'
			} else {
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - reboot')
				embed.setColor(`#F00000`)
				embed.setDescription("Неправильные аргументы")
				msg.channel.send({ embeds: [embed] });
			}
		}
		console.log("rebooting system...");
		let embed = new Discord.MessageEmbed()
		embed.setTitle(client.user.username + ' - reboot')
		embed.setColor(`#F36B00`)
		embed.setDescription(":arrows_counterclockwise: Перезапускаем систему...")
		msg.channel.send({ embeds: [embed] });
		client.user.setActivity('Перезагрузка...');
		client.user.setStatus('idle')
		setTimeout(() => {
			client.destroy()
			exec(executable_comm)
		},5000);
	}
}
module.exports = reboot

