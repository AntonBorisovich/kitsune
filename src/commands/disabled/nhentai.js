const Discord = require("discord.js")
const { NHentai, NHSort } = require('nhentai.js-api');

const api = new NHentai();

class Nhentai {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
		this.test = true; 
		this.vpn = true; 
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "img_NSFW";
		this.args = "";
		this.advargs = "При вводе id, будет выдана манга/додзинси под этим id.\nПри вводе без аргументов будет выдана случайная манга/додзинси на английском";
		this.usage = "<id>";
        this.desc = "ищет додзинси на nhentai.net";
        this.advdesc = "Ищет и показывает додзинси с сайта nhentai.net";
        this.name = "nhentai";
    }
	async testrun(msg, method) {
		try {
			const doujin = await api.random();
			if (doujin) {return "OK!"} else {return "error"};
		} catch(err) {
			return err;
		}
	}
    async run(client, msg, args){
        var argR = "";
		if (msg.channel.nsfw) {
			let message
			try {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(client.user.username + ' - nhentai')
				embed.setColor(`#F36B00`)
				embed.setDescription("Загрузка...")
				message = await msg.channel.send({ embeds: [embed] });
				var doujin = ""
				if ( args[1] != undefined && !isNaN(parseInt(args[1].replace(/#/g, ""))) ) {
					doujin = await api.hentai(parseInt(args[1].replace(/#/g, "")));
				} else {
					doujin = await api.random(true);
				}
				//console.log(doujin.tags)
				let tags_d = doujin.tags.tags
				let tags_m = []
				let loli = false
				tags_d.forEach(tag => {
					if (tag.name == "lolicon") {
						loli = true
					}
					tags_m.push("`" + tag.name + "`")
				})
				if (loli) {
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(client.user.username + ' - nhentai')
					embed.setColor(`#F00000`)
					embed.setDescription("**" + doujin.cleanTitle + "**\n*#" + doujin.id + "*\n\nТеги: " + tags_m.join(", ") + "\nСтраницы: `" + doujin.pages + '`\n\nК сожалению, найденная додзинси содержит тег ||lolicon|| и мы не можем показать её содержимое в Discord.')
					const buttonstart = new Discord.MessageButton()
						.setCustomId('nhentai_fbi_' + msg.author.id + '_next_0')
						.setLabel('Начать читать')
						.setStyle('PRIMARY')
						.setDisabled(true);
					const buttonstop = new Discord.MessageButton()
						.setCustomId('nhentai_fbi_' + msg.author.id + '_stop_0')
						.setLabel('Скрыть')
						.setStyle('DANGER')
					const buttonlink = new Discord.MessageButton()
						.setLabel('nhentai.net')
						.setURL(doujin.url)
						.setStyle('LINK')
					const buttons = new Discord.MessageActionRow()
						.addComponents(buttonstart, buttonstop, buttonlink)
					message.edit({ embeds: [embed], components: [buttons] });
					return
				}
				embed = new Discord.EmbedBuilder()
				embed.setTitle(client.user.username + " - nhentai")
				embed.setColor(`#F36B00`)
				embed.setDescription("**" + doujin.cleanTitle + "**\n*#" + doujin.id + "*\n\nТеги: " + tags_m.join(", ") + "\nСтраницы: `" + doujin.pages + "`")
				embed.setImage(doujin.cover)
				
				const buttonstart = new Discord.MessageButton()
					.setCustomId('nhentai_' + doujin.id + '_' + msg.author.id + '_next_0')
					.setLabel('Начать читать')
					.setStyle('PRIMARY')
				const buttonstop = new Discord.MessageButton()
					.setCustomId('nhentai_' + doujin.id + '_' + msg.author.id + '_stop_0')
					.setLabel('Скрыть')
					.setStyle('DANGER')
				const buttonlink = new Discord.MessageButton()
					.setLabel('nhentai.net')
					.setURL(doujin.url)
					.setStyle('LINK')
				const buttons = new Discord.MessageActionRow()
					.addComponents(buttonstart, buttonstop, buttonlink)
					
				message.edit({ embeds: [embed], components: [buttons] });
			} catch(err) {
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(client.user.username + ' - Error')
				embed.setColor(`#F00000`)
				embed.setDescription("Такого id не существует\n" + err)
				message.edit({ embeds: [embed] });
			}
		} else {
			let embed = new Discord.EmbedBuilder()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Эту команду можно использовать только в NSFW каналах!")
			msg.channel.send({ embeds: [embed] });
		}
	}
	
	async buttonreply(client, interaction){
		//console.log(interaction)
		const data = interaction.customId.split('_');
		if (data[2] != interaction.user.id) {
			let embed = new Discord.EmbedBuilder()
			embed.setTitle(client.user.username + ' - Error')
			embed.setColor(`#F00000`)
			embed.setDescription("Ты не можешь взаимодействовать с чужой мангой")
			interaction.reply({embeds: [embed], ephemeral: true})
			return
		}
		if (data[3] == 'stop') {
			if (data[4] == '0') {
				interaction.message.delete()
				return
			} else {
				setTimeout(() => {interaction.deferReply()}, 500);
				var doujin = await api.hentai(parseInt(data[1]));
				let tags_d = doujin.tags.tags
				let tags_m = []
				tags_d.forEach(tag => {
					tags_m.push("`" + tag.name + "`")
				})
				let embed = new Discord.EmbedBuilder()
				embed.setTitle(client.user.username + " - nhentai")
				embed.setColor(`#F36B00`)
				embed.setDescription("**" + doujin.cleanTitle + "**\n*#" + doujin.id + "*\n\nТеги: " + tags_m.join(", ") + "\nСтраницы: `" + doujin.pages + "`")
				embed.setImage(doujin.cover)
							
				const buttonstart = new Discord.MessageButton()
					.setCustomId('nhentai_' + doujin.id + '_' + data[2] + '_next_0')
					.setLabel('Начать читать')
					.setStyle('PRIMARY')
				const buttonstop = new Discord.MessageButton()
					.setCustomId('nhentai_' + doujin.id + '_' + data[2] + '_stop_0')
					.setLabel('Скрыть')
					.setStyle('DANGER')
				const buttonlink = new Discord.MessageButton()
					.setLabel('nhentai.net')
					.setURL(doujin.url)
					.setStyle('LINK')
				const buttons = new Discord.MessageActionRow()
					.addComponents(buttonstart, buttonstop, buttonlink)
				interaction.deleteReply()
				interaction.message.edit({ embeds: [embed], components: [buttons]});
			}
		}
		if (data[3] == "next") {
			setTimeout(() => {interaction.deferReply()}, 500);
			let curr_page = (parseInt(data[4]) + 1)
			var doujin = await api.hentai(parseInt(data[1]));
			let tags_d = doujin.tags.tags
				let tags_m = []
				tags_d.forEach(tag => {
					tags_m.push("`" + tag.name + "`")
				})
			let embed = new Discord.EmbedBuilder()
			embed.setTitle(client.user.username + " - nhentai")
			embed.setColor(`#F36B00`)
			embed.setDescription("**" + doujin.cleanTitle + "**\n*#" + doujin.id + "*\n\nТеги: " + tags_m.join(", ") + "\nСтраница: `" + curr_page + '/' + doujin.pages + "`")
			embed.setImage(doujin.images[(curr_page - 1)])
						
			const buttonprev = new Discord.MessageButton()
				.setCustomId('nhentai_' + doujin.id + '_' + data[2] + '_prev_' + curr_page)
				.setLabel('◀') // <
				.setStyle('PRIMARY')
				if (curr_page == "1") {
					buttonprev.setDisabled(true);
				}
			const buttonnext = new Discord.MessageButton()
				.setCustomId('nhentai_' + doujin.id + '_' + data[2] + '_next_' + curr_page)
				.setLabel('▶') // >
				.setStyle('PRIMARY')
				if (curr_page == doujin.pages) {
					buttonnext.setDisabled(true);
				}
			const buttonstop = new Discord.MessageButton()
				.setCustomId('nhentai_' + doujin.id + '_' + data[2] + '_stop_' + curr_page)
				.setLabel('Прекратить чтение') // STOP
				.setStyle('SECONDARY')
			const buttonlink = new Discord.MessageButton()
				.setLabel('nhentai.net')
				.setURL(doujin.url)
				.setStyle('LINK')
			const buttons = new Discord.MessageActionRow()
				.addComponents(buttonprev, buttonnext, buttonstop, buttonlink)
			interaction.deleteReply()
			interaction.message.edit({ embeds: [embed], components: [buttons]});
		}
		if (data[3] == "prev") {
			setTimeout(() => {interaction.deferReply()}, 500);
			let curr_page = (parseInt(data[4]) - 1)
			var doujin = await api.hentai(parseInt(data[1]));
			let tags_d = doujin.tags.tags
				let tags_m = []
				tags_d.forEach(tag => {
					tags_m.push("`" + tag.name + "`")
				})
			let embed = new Discord.EmbedBuilder()
			embed.setTitle(client.user.username + " - nhentai")
			embed.setColor(`#F36B00`)
			embed.setDescription("**" + doujin.cleanTitle + "**\n*#" + doujin.id + "*\n\nТеги: " + tags_m.join(", ") + "\nСтраница: `" + curr_page + '/' + doujin.pages + "`")
			embed.setImage(doujin.images[(curr_page - 1)])
						
			const buttonprev = new Discord.MessageButton()
				.setCustomId('nhentai_' + doujin.id + '_' + data[2] + '_prev_' + curr_page)
				.setLabel('◀') // <
				.setStyle('PRIMARY')
				if (curr_page == "1") {
					buttonprev.setDisabled(true);
				}
			const buttonnext = new Discord.MessageButton()
				.setCustomId('nhentai_' + doujin.id + '_' + data[2] + '_next_' + curr_page)
				.setLabel('▶') // >
				.setStyle('PRIMARY')
			const buttonstop = new Discord.MessageButton()
				.setCustomId('nhentai_' + doujin.id + '_' + data[2] + '_stop_' + curr_page)
				.setLabel('Прекратить чтение') // STOP
				.setStyle('SECONDARY')
			const buttonlink = new Discord.MessageButton()
				.setLabel('nhentai.net')
				.setURL(doujin.url)
				.setStyle('LINK')
			const buttons = new Discord.MessageActionRow()
				.addComponents(buttonprev, buttonnext, buttonstop, buttonlink)
			interaction.deleteReply()
			interaction.message.edit({ embeds: [embed], components: [buttons]});
		}
	}
}

module.exports = Nhentai