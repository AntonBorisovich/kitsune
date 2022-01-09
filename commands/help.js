const Discord = require("discord.js")

class Help {
    constructor(client, config, commands){
		this.client = client;
        this.config = config;
		this.test = "skip";
        this.commands = commands;
		this.perms = [""];
		this.category = "info";
		this.usage = "<команда>"
		this.args = ""
		this.advargs = "<команда> - вывод подробной информации о команде"
        this.desc = "помощь по командам";
		this.advdesc = "Помощь по командам";
        this.name = "help";
    }
	
    async run(client, msg, args){
		var Return = false
		if ( args[1] == "-f" && this.config['ownerID'] == msg.author.id ) {
				let command = this.commands.map(comm => `**${comm.name} ${comm.args}** - ${comm.desc}\n`).join("");
				let embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - Commands list')
				embed.setColor(`#F36B00`)
				embed.setDescription(command.toString() + '\nLoaded commands [FIXME]: ' + this.commands.length)
				msg.author.send({ embeds: [embed] });
				
				embed = new Discord.MessageEmbed()
				embed.setTitle(client.user.username + ' - ' + command.name)
				embed.setColor(`#F36B00`)
				embed.setDescription("Полный список команд отправлен тебе в лс")
				msg.channel.send({ embeds: [embed] });
				return
		}
		if (args[1]) {
			this.commands.forEach(command => {
				if ( args[1].toLowerCase() == command.name.toLowerCase() ){
					let embed = new Discord.MessageEmbed()
					embed.setTitle(client.user.username + ' - ' + command.name)
					embed.setColor(`#F36B00`)
					embed.setDescription("**" + this.config.prefix + command.name + " " + command.usage +  "**" )
					embed.addField("Описание:", command.advdesc);
					if (command.advargs != "") {
						embed.addField("Аргументы:", command.advargs);
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
		
        let embed = new Discord.MessageEmbed()
        embed.setTitle(client.user.username + ' - Commands list')
		embed.setColor(`#F36B00`)
		embed.setDescription(command.toString() + '\n' + this.config.prefix + 'help <команда> для большей информации')
		if (msg.isСommand()) {
			msg.reply({ embeds: [embed] });
			return
		}
        msg.channel.send({ embeds: [embed] });
    }
}

module.exports = Help

