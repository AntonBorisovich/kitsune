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
			.setStyle(Discord.ButtonStyle.Primary),
			new Discord.ButtonBuilder()
			.setURL('https://boosty.to/antonboris')
			.setLabel('Поддержать автора на Boosty')
			.setStyle(Discord.ButtonStyle.Link)
		);
		
        msg.reply({ embeds: [embed], components: [row] });
    }
	
	async butt(kitsune, msg, args){
		let embed
		let row
		switch(args[3]) {
			case 'GuideEntry':
				embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Base')
				embed.setColor(`#F36B00`)
				embed.setDescription(kitsune.user.username + " - это интересный бот для Discord, созданный по приколу для создания приколов (далее - бот). Следующий текст поможет вам научится общаться с ботом.\n\n" +
									"Общение с ботом происходит через команды. Команда всегда начинается с префикса, `" + this.values.prefix + "`, Например `" + this.values.prefix + "help`.\n" +
									"Команды являются текстовыми сообщениями в текстовом канале или в личном сообщении (далее - чат), к которому бот имеет минимальный доступ (`Просмотр канала`, `Отправлять сообщения`, `Встраивать ссылки`), настраиваемый в настройках канала.\n" +
									"Другие команды могут требовать больше прав, чем минимальные, например `\"Прикреплять файлы\"` для возможности отправлять изображения в чат и так далее.\n" +
									"Список доступных команд можно посмотреть, вызвав команду `help`, отправив `" + this.values.prefix + "help`, что вы уже успешно сделали.\n\n" +
									"Следующий раздел расскажет вам об основом предназначении бота - обработка изображений.")
				//embed.setFooter({ text: args[3] });
				row = new Discord.ActionRowBuilder().addComponents(
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideBase')
					.setLabel('Основы')
					.setStyle(Discord.ButtonStyle.Secondary)
					.setDisabled(true),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideImages')
					.setLabel('Вложения')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideArgs')
					.setLabel('Аргументы')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideHints')
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
			case 'GuideBase':
				embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Base')
				embed.setColor(`#F36B00`)
				embed.setDescription(kitsune.user.username + " - это интересный бот для Discord, созданный по приколу для создания приколов (далее - бот). Следующий текст поможет вам научится общаться с ботом.\n\n" +
									"Общение с ботом происходит через команды. Команда всегда начинается с префикса, `" + this.values.prefix + "`, Например `" + this.values.prefix + "help`.\n" +
									"Команды являются текстовыми сообщениями в текстовом канале или в личном сообщении (далее - чат), к которому бот имеет минимальный доступ (`Просмотр канала`, `Отправлять сообщения`, `Встраивать ссылки`), настраиваемый в настройках канала.\n" +
									"Другие команды могут требовать больше прав, чем минимальные, например `\"Прикреплять файлы\"` для возможности отправлять изображения в чат и так далее.\n" +
									"Список доступных команд можно посмотреть, вызвав команду `help`, отправив `" + this.values.prefix + "help`, что вы уже успешно сделали.\n\n" +
									"Следующий раздел расскажет вам об основом предназначении бота - обработка изображений.")
				//embed.setFooter({ text: args[3] });
				row = new Discord.ActionRowBuilder().addComponents(
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideBase')
					.setLabel('Основы')
					.setStyle(Discord.ButtonStyle.Secondary)
					.setDisabled(true),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideImages')
					.setLabel('Вложения')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideArgs')
					.setLabel('Аргументы')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideHints')
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
			case 'GuideImages':
				embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Images')
				embed.setColor(`#F36B00`)
				embed.setDescription("Вложения - любой прикреплённый к сообщению файл (изображение, видео, документ и другие). Этот бот работает только с вложениями типа `Изображение` (далее - картинка).\n\n" +
									"Зачастую команды, обрабатывающие картинки, возвращают обработанные картинки в чат, для чего требуется право `Прикреплять файлы` в настройках чата.\n" +
									"Бот умеет получать картинки несколькими способами:\n"+
									"- (`Вложение`) Можно прикрепить картинку к тому же сообщению с командой.\n"+
									"- (`Ответ`) Можно ответить на сообщение, которое содержит картинку.\n"+
									"- (`Поиск`) Можно просто отправить команду без вложенной картинки и ответов, тогда бот проверит последние 5-15 сообщений (в зависимости от команды) на предмет содержания картинок и возьмёт самую новую из найденных.\n"+
									"Для работы последних двух способов (`Ответ` и `Поиск`) требуется право `Читать историю сообщений`.\n\n"+
									"Следующий раздел расскажет вам об аргументах, которые помогут подстроить результат под вас.")
				//embed.setFooter({ text: args[3] });
				row = new Discord.ActionRowBuilder().addComponents(
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideBase')
					.setLabel('Основы')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideImages')
					.setLabel('Вложения')
					.setStyle(Discord.ButtonStyle.Secondary)
					.setDisabled(true),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideArgs')
					.setLabel('Аргументы')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideHints')
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
			case 'GuideArgs':
				embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Arguments')
				embed.setColor(`#F36B00`)
				embed.setDescription('Аргументы - дополнения к командам, описывающие параметры исполнения команды.\n\n'+
									"Аргументы прописываются после команды через пробел. Например: `" + this.values.prefix + "help <аргумент 1> <аргумент 2>`, `" + this.values.prefix + "china -f -h`.\n"+
									"Подробнее об аргументах к каждой команде можно узнать, прописав `" + this.values.prefix + "help <название команды>` (например `" + this.values.prefix + "help info` для вывода помощи по команде `info`).\n\n"+
									"Следующий раздел расскажет вам о некоторых трюках, которые помогут облегчить общение с ботом.")
				//embed.setFooter({ text: args[3] });
				row = new Discord.ActionRowBuilder().addComponents(
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideBase')
					.setLabel('Основы')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideImages')
					.setLabel('Вложения')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideArgs')
					.setLabel('Аргументы')
					.setStyle(Discord.ButtonStyle.Secondary)
					.setDisabled(true),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideHints')
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
			case 'GuideHints':
				embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Tricks')
				embed.setColor(`#F36B00`)
				embed.setDescription("В этом разделе будут некоторые трюки и полезная для некоторых информация.\n\n"+
									"- После получения команды ботом у вас будет период в 2 секунды, когда бот будет игнорировать новые команды.\n"+
									"- Если вы опечатались, то вы можете просто изменить сообщение, а не отправлять новое.\n"+
									"- Вы можете написать разработчикам раз в 2 часа через команду `feedback`, что бы предложить изменения или получить поддержку.\n"+
									"- Если вы не дали необходимые боту права, то бот сообщит вам об этом если есть хотя бы право `\"Отпралвять сообщения\"`\n" +
									"- Если вы хотите написать боту в ветке или на форуме, то вам нужно сначала упомянуть бота и только потом написать команду." +
									"\n\n"+
									"[Исходный код на GitHub](https://github.com/AntonBorisovich/kitsune)\n"+
									"[Библиотека Discord.js](https://discord.js.org/)\n")
				//embed.setFooter({ text: args[3] });
				row = new Discord.ActionRowBuilder().addComponents(
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideBase')
					.setLabel('Основы')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideImages')
					.setLabel('Вложения')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideArgs')
					.setLabel('Аргументы')
					.setStyle(Discord.ButtonStyle.Primary)
					.setDisabled(false),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_GuideHints')
					.setLabel('Приколы')
					.setStyle(Discord.ButtonStyle.Secondary)
					.setDisabled(true),
					new Discord.ButtonBuilder()
					.setCustomId(args[0] + '_0_help_goback')
					.setLabel('Закрыть')
					.setStyle(Discord.ButtonStyle.Danger)
					.setDisabled(false),
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

