const Discord = require("discord.js");
const {dependencies} = require('../../package.json');
const os = require('os');
const launch_time = Date.now();

class Info {
    constructor(kitsune, commands, values){
		
		//задать полученые значения для дальнейшего использования в коде команды
		this.values = values;
        this.kitsune = kitsune;
        this.commands = commands;
		
		this.root = false; // запуск только разработчикам
		this.perms = [""];
        this.name = "info"; // имя команды
		this.desc = "информация"; // описание команды в общем списке команд
		this.advdesc = "Информация о боте"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = ""; // описание аргументов в помоще по конкретной команде
		this.advargs = ""; // аргументы в помоще по конкретной команде
    }

    run(kitsune, msg, args){
		let embed = new Discord.EmbedBuilder()
		embed.setTitle(kitsune.user.username + ' - ' + this.name)
		embed.setColor(`#F36B00`)
		embed.setDescription(kitsune.user.username + ' - бот для Discord для генерации разных мемов.\nРазработчик: <@' + this.values.developers[0] + '>')
		embed.setFooter({ text: 'Версия: ' + this.values.version });
		// const buttonlink = new Discord.MessageButton()
			// .setLabel('Политика конфиденциальности')
			// .setURL("https://docs.google.com/document/d/e/2PACX-1vQK2d9hAjIXB5Ck9zdTbLALsradpgM6sHxc_J2btYr_vvNVStKgZLHb4ZOdyC-5kn8A1lqzBMszyNbQ/pub")
			// .setStyle('LINK')
		// const buttons = new Discord.MessageActionRow()
			// .addComponents(buttonlink)
		//throw('error');
		msg.channel.send({embeds: [embed]}) //, components: [buttons]
	}
			
	// debug output
	
	// some functions
	isowner(kitsune, msg, args){
		if ( this.config.ownerID == msg.author.id ) {
			return 'true' 
		} else {
			return 'false'
		}
	}
	bot_uptime() {
		let sec = Math.floor((Date.now() - launch_time) / 1000 )
		let min = Math.floor(sec / 60)
		let hour = Math.floor(min / 60)
		let day = Math.floor(hour / 24)

		return day + ' days ' + (hour - (24 * day)) + ' hours ' + (min - (60 * hour)) + ' minutes ' + (sec - (60 * min)) + ' seconds';
	}

	sec2time(seconds) {
		let sec = Math.floor(seconds)
		let min = Math.floor(sec / 60)
		let hour = Math.floor(min / 60)
		let day = Math.floor(hour / 24)

		return day + ' days ' + (hour - (24 * day)) + ' hours ' + (min - (60 * hour)) + ' minutes ' + (sec - (60 * min)) + ' seconds';
	}
	
	//writing output
	advinfo(client, msg, args){
		//console.log(msg)
		//getting current date
		let now = new Date()
		
		//getting timezone
		let hrsdif = -(new Date().getTimezoneOffset() / 60)	
		
		// correcting numbers
		if (now.getDate() < 10) {
			var date = `0${now.getDate()}`
		} else {
			var date = now.getDate()
		}
		if (now.getMonth() < 10) {
			var month = `0${(now.getMonth() + 1)}`
		} else {
			var month = (now.getMonth() + 1)
		}
		if (now.getHours() < 10) {
			var hour = `0${now.getHours()}`
		} else {
			var hour = now.getHours()
		}
		if (now.getSeconds() < 10) {
			var secon = `0${now.getSeconds()}`
		} else {
			var secon = now.getSeconds()
		}
		
		let embed = new Discord.EmbedBuilder();
		embed.setTitle(client.user.username + ' - Debug info')
		embed.setColor(`#F36B00`)
		
		embed = new Discord.EmbedBuilder()
		embed.setTitle(client.user.username + ' - Advanced info')
		embed.setColor(`#F36B00`)
		embed.setDescription('Подробная информация выслана тебе в лс')
		msg.channel.send({embeds: [embed]})
	}
}

module.exports = Info

