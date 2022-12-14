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
		if (args[1]) { // если пользователь хочет подробнее о команде
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
					msg.reply({ embeds: [embed] });
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
		const row = new Discord.ActionRowBuilder().addComponents(
			new Discord.ButtonBuilder()
			.setCustomId(msg.author.id + '_0_help_GuideEntry')
			.setLabel('Подробный гайд по использованию')
			.setStyle(Discord.ButtonStyle.Primary)
		);
		
        msg.reply({ embeds: [embed], components: [row] });
    }
	
	async butt(kitsune, msg, args){
		let embed
		let row
		switch(args[3]) {
			case 'GuideEntry':
				embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Help guide')
				embed.setColor(`#F36B00`)
				embed.setDescription('Скоро тут будет инструкция и первые шаги пользования ботом.')
				//embed.setFooter({ text: args[3] });
				row = new Discord.ActionRowBuilder().addComponents(
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_Guide0')
					.setLabel('Общее')
					.setStyle(Discord.ButtonStyle.Secondary)
					.setDisabled(true),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_Guide1')
					.setLabel('Аргументы')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_Guide2')
					.setLabel('Приколы')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_goback')
					.setLabel('Закрыть')
					.setStyle(Discord.ButtonStyle.Danger)
					.setDisabled(false),
				);
				msg.reply({ embeds: [embed], components: [row] })
				break
			case 'Guide0':
				embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Help guide')
				embed.setColor(`#F36B00`)
				embed.setDescription('Скоро тут будет инструкция и первые шаги пользования ботом.')
				//embed.setFooter({ text: args[3] });
				row = new Discord.ActionRowBuilder().addComponents(
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_Guide0')
					.setLabel('Общее')
					.setStyle(Discord.ButtonStyle.Secondary)
					.setDisabled(true),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_Guide1')
					.setLabel('Аргументы')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_Guide2')
					.setLabel('Приколы')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_goback')
					.setLabel('Закрыть')
					.setStyle(Discord.ButtonStyle.Danger)
					.setDisabled(false),
				);
				msg.deferUpdate();
				msg.message.edit({ embeds: [embed], components: [row] })
				break
			case 'Guide1':
				embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Arguments guide')
				embed.setColor(`#F36B00`)
				embed.setDescription('Скоро тут будет инструкция по аргументам к командам.')
				//embed.setFooter({ text: args[3] });
				row = new Discord.ActionRowBuilder().addComponents(
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_Guide0')
					.setLabel('Общее')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_Guide1')
					.setLabel('Аргументы')
					.setStyle(Discord.ButtonStyle.Secondary)
					.setDisabled(true),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_Guide2')
					.setLabel('Приколы')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_goback')
					.setLabel('Закрыть')
					.setStyle(Discord.ButtonStyle.Danger)
					.setDisabled(false),
				);
				msg.deferUpdate();
				msg.message.edit({ embeds: [embed], components: [row] })
				break
			case 'Guide2':
				embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Some advanced info')
				embed.setColor(`#F36B00`)
				embed.setDescription('Скоро тут будут всякие трюки и полезное о боте.')
				//embed.setFooter({ text: args[3] });
				row = new Discord.ActionRowBuilder().addComponents(
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_Guide0')
					.setLabel('Общее')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_Guide1')
					.setLabel('Аргументы')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_Guide2')
					.setLabel('Приколы')
					.setStyle(Discord.ButtonStyle.Secondary)
					.setDisabled(true),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_goback')
					.setLabel('Закрыть')
					.setStyle(Discord.ButtonStyle.Danger)
					.setDisabled(false)
				);
				msg.deferUpdate();
				msg.message.edit({ embeds: [embed], components: [row] })
				break
				
			case 'goback':
				msg.message.delete()
				break
				
			default:
				embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription('Не получилось понять данные с кнопки.')
				embed.setFooter({ text: args.join('_') });
				row = new Discord.ActionRowBuilder().addComponents(
					new Discord.ButtonBuilder()
					.setCustomId('sus')
					.setLabel('Исправить')
					.setDisabled(true)
					.setStyle(Discord.ButtonStyle.Secondary)
				);
				msg.reply({ embeds: [embed], components: [row] })
				break
		}
		
	}
}

module.exports = Help

