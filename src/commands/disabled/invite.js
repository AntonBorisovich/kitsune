const Discord = require("discord.js")
const Permission = Discord.Permissions

class Invite {
    constructor(client, config, commands, customvars){
		this.customvars = customvars;
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "info";
		this.args = ""
		this.usage = this.args
		this.advargs = this.args
        this.desc = "пригласить бота";
        this.advdesc = "Присылает ссылку для приглашения бота на свой сервер";
        this.name = "invite";
    }

    run(client, msg, args){
		
		let invite_link = client.generateInvite({
			permissions: [
				//Permission.FLAGS.ADD_REACTIONS,
				Permission.FLAGS.VIEW_CHANNEL,
				Permission.FLAGS.SEND_MESSAGES,
				Permission.FLAGS.EMBED_LINKS,
				Permission.FLAGS.ATTACH_FILES,
				//Permission.FLAGS.READ_MESSAGE_HISTORY,
				//Permission.FLAGS.VIEW_GUILD_INSIGHTS,
				//Permission.FLAGS.CHANGE_NICKNAME,
				//Permission.FLAGS.CONNECT,
				//Permission.FLAGS.SPEAK,
				//Permission.FLAGS.MANAGE_MESSAGES,
			],
			scopes: ['bot', 'applications.commands'],
		});
        let embed = new Discord.EmbedBuilder()
		embed.setTitle(client.user.username + ' - ' + this.name)
		embed.setDescription('[Пригласить бота на свой сервер](' + invite_link + ')')
		embed.setColor(`#F36B00`)
		msg.channel.send({ embeds: [embed] });;
    }
}

module.exports = Invite

