const Discord = require("discord.js")

class Time {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
		this.test = "skip"; 
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "Utils";
		this.usage = "<выходной пояс> ~~<время> <входной пояс>~~";
		this.advargs =  "**<выходной пояс>** - вывод текущего времени в данном часовом поясе в формате: `+3`, `3`, `-3`, `+3:30`, `3:30`, `-3:30` \n" +
						"~~ **<время>** - время в формате: ЧЧ:ММ ~~\n" +
						"~~ **<входной пояс>** - часовой пояс указанной вами даты в аргументе <время> ~~ \n\n" +
						
						"без аргументов результатом будет текущее время бота"
		this.args = "";
        this.desc = "время и часовые пояса";
        this.advdesc = "Конвертер времени и часовых поясов";
        this.name = "time";
    }

    async run(client, msg, args){
		
		function isInt(value) {
			return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
		}
		
		if (args[1]) {
			let outputzone = args[1].split(":")
			if (!args[2]) { // current time in <data> timezone
				if (!isInt(outputzone[0])) { 
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Неверные данные")
					msg.channel.send({ embeds: [embed] });
					return
				}
				if (outputzone[0] > 12) {
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Нет такого часового пояса")
					msg.channel.send({ embeds: [embed] });
					return
				}
				if (!outputzone[1]) {
					outputzone.push("0")
				}
				if (!isInt(outputzone[1])) {
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Неверные данные")
					msg.channel.send({ embeds: [embed] });
					return
				}
				if (outputzone[1] >= 60) {
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Нет такого часового пояса")
					msg.channel.send({ embeds: [embed] });
					return
				}
				if (outputzone[1] >= 60) {
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(client.user.username + ' - Error')
					embed.setColor(`#F00000`)
					embed.setDescription("Нет такого часового пояса")
					msg.channel.send({ embeds: [embed] });
					return
				}
				const date = new Date()
				if (Number(outputzone[0]) != 0) {
					senddate(msg, date, outputzone[0], String((Number(outputzone[1]) * Math.sign(Number(outputzone[0])))))
					return
				} else if (outputzone[0].startsWith('-')) {
					senddate(msg, date, outputzone[0], String((-(Number(outputzone[1])))))
					return
				} else {
					senddate(msg, date, outputzone[0], outputzone[1])
					return
				}
			}
		}
		
		senddate(msg)
		
		async function senddate(msg, date, timezone_h, timezone_m) {
			if (!date) {
				if (msg.editedTimestamp) {
					date = msg.editedAt
				} else {
					date = msg.createdAt
				}
			}
			
			let timezone
			let timezone_minutes
			
			if (!(timezone_h && timezone_m)) {
				timezone = Math.floor((date.getTimezoneOffset() * -1 / 60))
				timezone_minutes = Math.floor((date.getTimezoneOffset() * -1) - (timezone * 60))
			} else {
				timezone = timezone_h
				timezone_minutes = timezone_m
			}
			
			let newmin
			newmin = (date.getUTCMinutes() + Number(timezone_minutes))
			const newhour = (date.getUTCHours() + Number(timezone))
			date.setUTCHours(newhour)
			date.setUTCMinutes(newmin)
			
			var months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
			var weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
			
			if (timezone == 0 && timezone_minutes == 0) {timezone = "GMT"}
			if (timezone > 0) {timezone = "GMT+" + Math.abs(timezone)} else if (isFinite(timezone)) {timezone = "GMT" + timezone}
			if (timezone_minutes != 0 && timezone != 0) {
				timezone += ":" + Math.abs(timezone_minutes)
			} else if (timezone_minutes != 0 && timezone == 0) {
				timezone += "0:" + Math.abs(timezone_minutes)
			}
			
			var seconds = date.getUTCSeconds()
			if (seconds < 10) {
				seconds = "0" + seconds
			}
			
			var mins = date.getUTCMinutes()
			if (mins < 10) {
				mins = "0" + mins
			}
			
			var hours = date.getUTCHours()
			if (hours < 10) {
				hours = "0" + hours
			}

			let embed = new Discord.EmbedBuilder()
			embed.setTitle(client.user.username + ' - time')
			embed.setColor(`#F36B00`)
			embed.setDescription("Текущее время (" + timezone + "): " + date.getUTCFullYear() + " " + weekdays[date.getUTCDay()] + " " + months[date.getUTCMonth()] + " " + date.getUTCDate() + " " + hours + ":" + mins + ":" + seconds)
			embed.setTimestamp()
			msg.channel.send({ embeds: [embed] }); 
		}
    }
}

module.exports = Time

