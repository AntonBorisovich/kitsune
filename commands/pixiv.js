const Discord = require("discord.js")
const PixivApi = require('pixiv-api-client');
const pixiv = new PixivApi();
//pixiv.tokenRequest(code, codeVerifier)

//user_ksfx7582
//Antt0989

class Pixiv {
    constructor(client, config, commands){
        this.client = client;
        this.config = config;
        this.commands = commands;
		this.perms = [""];
		this.category = "img";
		this.args = "<id>";
		this.advargs = "";
		this.usage = "";
        this.desc = "кидает пикчи с pixiv.net hide";
        this.advdesc = "Ищет фотокарточки с сайта pixiv.net";
        this.name = "pixiv";
    }

    run(client, msg, args){
        let embed = new Discord.MessageEmbed()
		embed.setTitle(client.user.username + ' - Error')
		embed.setColor(`#F00000`)
		embed.setDescription("in dev\n\nTODO:\nFind login token\nFind the way to show multiple image works\n~~Like function? for what?~~")
		msg.channel.send({ embeds: [embed] });	
    }
}

module.exports = Pixiv

