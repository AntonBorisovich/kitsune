const Discord = require("discord.js");

class Help {
    constructor(kitsune, commands, values){
		
		//задать полученые значения для дальнейшего использования в коде команды
		this.values = values;
        this.kitsune = kitsune;
        this.commands = commands;
		
		this.root = false; // запуск только разработчикам
		this.perms = [""];
        this.name = "help"; // имя команды
		this.desc = "помощь по командам"; // описание команды в общем списке команд
		this.advdesc = "Помощь по командам"; // описание команды в помоще по конкретной команде
		this.args = ""; // аргументы в общем списке команд
		this.argsdesc = "<команда> - имя команды, о которой вы хотите узнать больше"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<команда>"; // аргументы в помоще по конкретной команде
    }
	
    async run(kitsune, msg, args){
		var Return = false
		if ( args[1] == "-f" && this.config['ownerID'] == msg.author.id ) {
				let command = this.commands.map(comm => `**${comm.name} ${comm.args}** - ${comm.desc}\n`).join("");
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Commands list')
				embed.setColor(`#F36B00`)
				embed.setDescription(command.toString() + '\nLoaded commands [FIXME]: ' + this.commands.length)
				msg.author.send({ embeds: [embed] });
				
				embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Full command list')
				embed.setColor(`#F36B00`)
				embed.setDescription("Полный список команд отправлен тебе в лс")
				msg.channel.send({ embeds: [embed] });
				return
		}
		if (args[1]) {
			this.commands.forEach(command => {
				if ( args[1].toLowerCase() == command.name.toLowerCase() ){
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(kitsune.user.username + ' - ' + command.name)
					embed.setColor(`#F36B00`)
					embed.setDescription("**" + this.values.prefix + command.name + " " + command.advargs +  "**" )
					embed.addFields([{ name: "Описание:", value: command.advdesc}]);
					if (command.advargs != "") {
						embed.addFields([{ name:"Аргументы:", value: command.argsdesc}]);
					}
					msg.channel.send({ embeds: [embed] });
					Return = true
				}
			})
		}
		
		if (Return) { return }
		
		const allcommands = this.commands
		let pubcommands = this.commands.slice(0)
		await allcommands.forEach(command => { if ( command.desc.toLowerCase().endsWith('hide') ) { pubcommands.splice(pubcommands.indexOf(command), 1) } })
		let command = pubcommands.map(comm => `**${comm.name} ${comm.args}** - ${comm.desc}\n`).join("");
		
        let embed = new Discord.EmbedBuilder()
        embed.setTitle(kitsune.user.username + ' - Commands list')
		embed.setColor(`#F36B00`)
		embed.setDescription(command.toString() + '\n' + this.values.prefix + 'help <команда> для большей информации')
		if (msg.isCommand == true) {
			msg.reply({ embeds: [embed] });
			return
		}
        msg.channel.send({ embeds: [embed] });
    }
}

module.exports = Help

