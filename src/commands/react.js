const Discord = require("discord.js")

class React {
    constructor(kitsune, config, commands, values){
		this.values = values;
        this.kitsune = kitsune;
        this.commands = commands;
		
		this.perms = ["AddReactions"];

		this.name = "react"; // имя команды
		this.desc = "реакция на сообщение";
		this.argsdesc = "Выбрать сообщение можно ответив на него или указав <id> сообщения\nВ поле <эмодзи> обязательно должен быть эмодзи в любом представленном виде, т.е. или `:flushed:` или `😳` или `sus (как название серверного эмодзи)`.";
		this.args = "<эмодзи> <id>";
		this.advdesc = "Ставит любую реакцию (встроенную или серверную) на любое доступное боту сообщение."; // описание аргументов в помоще по конкретной команде
		this.advargs = "<эмодзи> <id>";
    }

    async run(kitsune, msg, args){
		try {
			let msgrep = false
			if (!args[1]){ // если эмодзи не указан
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("А что ставить то? Укажи эмодзи.")
				msg.channel.send({ embeds: [embed] });
				return
			};
			
			// ищем референс
			if (msg.guild.members.me.permissionsIn(msg.channel).has([Discord.PermissionsBitField.Flags.ReadMessageHistory]) && msg.type == "19" && msg.reference) { // если есть ответ (reply) то проверить права
				msgrep = await msg.fetchReference(); // попробовать достать исходное сообщение
				if (msgrep) { // если удалось, то работать с ним
					await work(kitsune, msgrep, msg, args);
					return
				} 
			};
			
			if (args[2]) { // если указан id то попробовать найти его
				msgrep = await msg.channel.messages.fetch(args[2].toString()); // попробовать найти сообщение
				if (msgrep) { // если удалось, то работать с ним
					await work(kitsune, msgrep, msg, args);
					return
				} 
			};
			if (!msgrep) {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(kitsune.user.username + ' - error')
				embed.setColor(`#F00000`)
				embed.setDescription("Не удалось поставить реакцию. Возможно, у бота нету прав на это сообщение или сообщения не существует. А ну или вы просто не указали сообщение")
				msg.channel.send({ embeds: [embed] });
			};
			
			async function work(kitsune, msg, origmsg, args) { // работать
				try {
					let reactsend = false
					if (args[1].replaceAll(/\p{Emoji}/ug, '') == '') { // если это просто эмодзи
						msg.react(args[1]); // ставим какаху 
						reactsend = true;
					};
					if (args[1].startsWith(':')) { // если это имя сложного эмодзи
						const emojiname = args[1].substr(1,(args[1].length - 2)); // форматируем имя
						//console.log(': emoji name: ' + emojiname);
						const bean = msg.guild.emojis.cache.find(emoji => emoji.name === emojiname); // получаем его из дискорда по имени
						if (bean.name == emojiname) { // проверяем нашлось ли правильно
							msg.react(bean); // ставим какаху 
							reactsend = true;
						} else {
							//console.log(err)
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - error')
							embed.setColor(`#F00000`)
							embed.setDescription("Не удалось найти этот эмодзи.")
							msg.channel.send({ embeds: [embed] });
							return;
						};
					};
					if (args[1].startsWith('<:')) { // если это имя сложного эмодзи
						//console.log(': input: ' + args[1])
						const emojiname = args[1].substr(2,(args[1].substr(2, (args[1].length - 1)).indexOf(':'))); // форматируем имя
						//console.log(': emoji name: ' + emojiname);
						const bean = msg.guild.emojis.cache.find(emoji => emoji.name === emojiname); // получаем его из дискорда по имени
						if (bean.name == emojiname) { // проверяем нашлось ли правильно
							msg.react(bean); // ставим какаху 
							reactsend = true;
						} else {
							console.log(err)
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - error')
							embed.setColor(`#F00000`)
							embed.setDescription("Не удалось найти этот эмодзи.")
							msg.channel.send({ embeds: [embed] });
							return;
						};
					};
					if (!reactsend) { // попробуем последний раз ченить найти
						const bean = msg.guild.emojis.cache.find(emoji => emoji.name === args[1]); // ищем максимально тупо
						if (bean.name == args[1]) { // УРА! НАШЛОСЬ!
							msg.react(bean); // ставим какаху 
							reactsend = true;
						} else { // неа, ниче не нашлось
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - error')
							embed.setColor(`#F00000`)
							embed.setDescription("Не удалось найти этот эмодзи.")
							msg.channel.send({ embeds: [embed] });
							return;
						};
					};
					if (reactsend) { // если всё поставилось то информируем об этом
						origmsg.react('✅');
					};
				} catch(err) {
					console.log(err)
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(kitsune.user.username + ' - error')
					embed.setColor(`#F00000`)
					embed.setDescription("Не удалось поставить реакцию. Возможно, вы не указали реакцию или указали её не правильно.")
					msg.channel.send({ embeds: [embed] });
				}
			}
			
		} catch(err) {
			console.log(err)
			let embed = new Discord.EmbedBuilder()
			embed.setTitle(kitsune.user.username + ' - error')
			embed.setColor(`#F00000`)
			embed.setDescription("Не удалось поставить реакцию. Возможно, у бота нету прав на это сообщение или сообщения не существует.")
			msg.channel.send({ embeds: [embed] });
		}
    }
}

module.exports = React

