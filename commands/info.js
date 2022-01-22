const Discord = require("discord.js")
const {dependencies} = require('../package.json');
const os = require('os');
let launch_time = Date.now();

class Info {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
		this.test = "skip"; 
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "info";
		this.args = ""
		this.usage = ""
		this.advargs = ""
        this.desc = "информация о боте";
		this.advdesc = "Информация о боте";
        this.name = "info";
    }

    run(client, msg, args){
		if (this.config['ownerID'] == msg.author.id && args[1] == '-f') {
			this.advinfo(client, msg, args)
			return
		}

		let embed = new Discord.MessageEmbed()
		embed.setTitle(client.user.username + ' - About')
		embed.setThumbnail('https://i.imgur.com/Maz0oZ1.png')
		embed.setColor(`#F36B00`)
		embed.setDescription(client.user.username + ' - бот для дискорда с NSFW и Fun функциями\nСоздатель: <@' + this.config.ownerID + '>')
		if (this.customvars.updateversion) {
			embed.setFooter({ text: 'Версия: ' + this.customvars.version + '\nДоступно обновление "' + this.customvars.updateversion + '", которое будет установлено после перезапуска бота'});
		} else {
			embed.setFooter({ text: 'Версия: ' + this.customvars.version });
		}
		
		// const buttonlink = new Discord.MessageButton()
			// .setLabel('Политика конфиденциальности')
			// .setURL("https://docs.google.com/document/d/e/2PACX-1vQK2d9hAjIXB5Ck9zdTbLALsradpgM6sHxc_J2btYr_vvNVStKgZLHb4ZOdyC-5kn8A1lqzBMszyNbQ/pub")
			// .setStyle('LINK')
		// const buttons = new Discord.MessageActionRow()
			// .addComponents(buttonlink)
		msg.channel.send({embeds: [embed]}) //, components: [buttons]
	}
			
	// -f (full info)
	
	// some functions
	isowner(client, msg, args){
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
		
		let embed = new Discord.MessageEmbed();
		embed.setTitle(client.user.username + ' - Advanced info')
		embed.setColor(`#F36B00`)
		embed.setDescription('```\n' + client.user.username + '\n' + date + '.' + month + '.' + now.getFullYear() + '  ' + hour + ':' + secon + '  UTC+' + hrsdif + '\n' +
							 '\nПоздравляем, бот работает!\n\n```')
		embed.addField('---== Bot info ==---', 
		'```\n' +
		'name: ' + client.user.username + '\n' +
		'tag: ' + client.user.tag + '\n' +
		'id: ' + client.user.id + '\n' +
		'ping: ' + Math.round(client.ws.ping) + ' ms' +
		'\n```')
		
		embed.addField('---== Bot additional info ==---', 
		'```\n' +
		'Version: ' + this.customvars.version + '\n' +
		'Loaded commands: ' + this.commands.length + '\n' +
		'prefix: ' + this.config.prefix + '\n' +
		'CPU architecture: ' + os.arch() + '\n' +
		'OS Platform: ' + os.platform() + '\n' +
		'OS Type: ' + os.type() + '\n' +
		'OS Release: ' + os.release() + '\n' +
		'OS uptime: ' + this.sec2time( os.uptime() ) + '\n' +
		'Bot uptime: ' + this.bot_uptime() + '\n' +
		'RAM: ' + Math.floor( ( os.totalmem() - os.freemem() ) / 1048576 ) + '/' + Math.floor( os.totalmem() / 1048576 ) + 'MB' +
		'\n```')
		
		let guilds = client.guilds.cache.map(guild => `${guild.name} (${guild.id})\n`).join("");
		embed.addField('---== Bot guilds ==---',
		'```\n' + 
		guilds.toString() + '\n' +
		'total guilds quantity: ' + client.guilds.cache.size + 
		'\n```')
		
		embed.addField('---== Client info ==---', 
		'```\n' +
		'name: ' + msg.author.username + '\n' +
		'tag: ' + msg.author.tag + '\n' +
		'id: ' + msg.author.id + '\n' +
		'ping: ' + (Date.now() - msg.createdTimestamp) + ' ms\n' +
		'bot owner: ' + this.isowner(client,msg,args) + '\n' +
		//'joined on server at: ' + msg.guild.joinedAt + ' (FIXME)' + 
		'\n```')
		
		//let hasperms = [""]
		//let allperms = ["SEND_MESSAGES", "ADMINISTRATOR"]
		
		//allperms.forEach(perm => {
		//	eval('if (msg.guild.me.permissions.has(Discord.Permissions.FLAGS.' + perm + ')) {' +
		//		'hasperms.push[' + perm + ']' +
		//	'}'
		//	)
		//	
		//})
		//console.log(hasperms)
		embed.addField('---== Permissions ==---', '```\nTODO (info.js)\n```')
		//console.log(msg.guild.me)
		if (msg.guild) {
			embed.addField('---== Server info ==---', 
			'```\n' +
			'name: ' + msg.guild.name + '\n' +
			'id: ' + msg.guild.id + '\n' +
			'users: ' + msg.guild.memberCount + '/' + msg.guild.maximumMembers + '\n' +
			'boosts: ' + msg.guild.premiumSubscriptionCount + '\n' +
			'boost level: ' + msg.guild.premiumTier + '\n' +
			'verification level: ' + msg.guild.verificationLevel + '\n' +
			'verified: ' + msg.guild.verified  +
			'\n```')
		}
		
		embed.addField('---== Libraries/APIs used ==---',
		'```\nNode.js | ' + process.version.replace(/v/g, "") + '\n' + JSON.stringify(dependencies).replace(/\,/g, "\n").replace(/[ \{, \}, \", \^, , ]/g, "" ).replace(/\:/g, " - ") + '\n```')
		msg.author.send({embeds: [embed]})
		
		embed = new Discord.MessageEmbed()
		embed.setTitle(client.user.username + ' - Advanced info')
		embed.setColor(`#F36B00`)
		embed.setDescription('Подробная информация выслана тебе в лс')
		msg.channel.send({embeds: [embed]})
	}
}

module.exports = Info

