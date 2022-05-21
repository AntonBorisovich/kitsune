const Discord = require("discord.js")
const {PythonShell} = require('python-shell')

class Mesh {
    constructor(kitsune, commands, values){
		//задать полученые значения для дальнейшего использования в коде команды
		this.values = values;
        this.kitsune = kitsune;
        this.commands = commands;
		
		this.root = false; // запуск только разработчикам
		this.perms = [""];
        this.name = "mesh"; // имя команды
		this.desc = "ответы к тестам МЭШ"; // описание команды в общем списке команд
		this.advdesc = "Ищет ответы на тесты МЭШ (Московская Электронная Школа)"; // описание команды в помоще по конкретной команде
		this.args = "<ссылка>"; // аргументы в общем списке команд
		this.argsdesc = "<ссылка> - Ссылка на тест. Важно, что бы она была как домашняя работа, а не тест найденый в Библиотеке МЭШ."; // описание аргументов в помоще по конкретной команде
		this.advargs = "<ссылка>"; // аргументы в помоще по конкретной команде
    };

    async run(kitsune, msg, args){
		if (args[1]) {
			try {	
				await PythonShell.run('src/assets/mesh/mesh.py', {args: [args[1]]}, async function (err,code,signal) {
					if (err) {
						console.error(err)
						let embed = new Discord.MessageEmbed()
						embed.setTitle(kitsune.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Произошла ошибка")
						embed.setFooter({text: String(err)})
						msg.channel.send({ embeds: [embed] });
						return;
					}
					
					code = String(code).split('ХУЙ')
					if (String(code) == "wrong_link") {
						console.error(code)
						let embed = new Discord.MessageEmbed()
						embed.setTitle(kitsune.user.username + ' - Error')
						embed.setColor(`#F00000`)
						embed.setDescription("Неправильная ссылка")
						//embed.setFooter({text: String(code)})
						msg.channel.send({ embeds: [embed] });
						return;
					}
					let embed = new Discord.MessageEmbed()
					embed.setTitle(kitsune.user.username + ' - МЭШ')
					embed.setColor(`#F36B00`)
					let output
					await code.forEach(input => {
						input = input.replace(/,HOMOSEC/g, "\n**Ответ:**")
						input = input.replace(/ГОВНО/g, "\n\n")
						input = input.replace(/:  ,/g, ": ")
						input = input.replace(/. ,/g, ".\n")
						if (input.endsWith(",")) {
							input = input.substring(0, (input.length - 1))
						}
						output += input
					})
					if (output.startsWith(undefined)) {
						output = output.substring(10, output.length)
					}
					embed.setDescription(output)
					msg.channel.send({ embeds: [embed] });
				})
			} catch (err) {
				let embed = new Discord.MessageEmbed()
				embed.setTitle(kitsune.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Произошла ошибка")
				embed.setFooter({text: String(err)})
				msg.channel.send({ embeds: [embed] });
			}
		} else {
			let embed = new Discord.MessageEmbed()
			embed.setTitle(kitsune.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Не указана ссылка на тест")
			msg.channel.send({ embeds: [embed] });
		}
    }
}

module.exports = Mesh

