const Discord = require("discord.js");
const resetColor = "\x1b[0m";
let firstBoot = true;
let workfunc;
let typeString;
let textColor;
let embedColor;

function getTimestamp() {
	var date = new Date();
	var hours = date.getHours();
	if (hours < 10) {
		hours = "0" + hours;
	};
	var mins = date.getMinutes();
	if (mins < 10) {
		mins = "0" + mins;
	};
	var seconds = date.getSeconds();
	if (seconds < 10) {
		seconds = "0" + seconds;
	};
	var result = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + hours + ":" + mins + ":" + seconds;
	return result;
};

workfunc = async function(kitsune, type, log, values) { // задание первой функции для определения типа логирования (дебаг или штатный)
	if (values.debug) { // если дебаг то логировать всё
		workfunc = async function(kitsune, type, log, values) {
			switch(type){
				case 'info':
					typeString = 'D_INFO';
					textColor = resetColor; // default
					embedColor = `#AAAAAA`;
					break;
				case 'warning':
					typeString = 'D_WARNING';
					textColor = "\x1b[33m"; // yellow
					embedColor = `#fad201`;
					break;
				case 'error':
					typeString = 'D_ERROR';
					textColor = "\x1b[31m"; // red
					embedColor = `#ff4f00#`;
					break;
				case 'sysinfo':
					typeString = 'INFO';
					textColor = resetColor; // default
					embedColor = `#AAAAAA`;
					break;
				case 'syswarning':
					typeString = 'WARNING';
					textColor = "\x1b[33m"; // yellow
					embedColor = `#fad201`;
					break;
				case 'syserror':
					typeString = 'ERROR';
					textColor = "\x1b[31m"; // red
					embedColor = `#ff4f00#`;
					break;
				default:
					typeString = String(type);;
					textColor = resetColor; // defualt
					embedColor = `#AAAAAA`;
					break;
			};
					
			console.log(textColor + getTimestamp() + ' [' + typeString + '] ' + log + resetColor);
					
			let embed = new Discord.EmbedBuilder();
			embed.setTitle(kitsune.user.username + ' - Log');
			embed.setColor(embedColor);
			embed.setDescription(getTimestamp());
			embed.addFields([{name: typeString, value: '```\n' + String(log) + '\n```'}]);
			embed.setTimestamp();
			const botowner = await kitsune.users.fetch(values.developers[0]);
			botowner.send({ embeds: [embed] });
			return;
		};
	} else { // если штатный режим то логировать только системные оповещения
		workfunc = async function(kitsune, type, log, values) {
			switch(type){
				case 'sysinfo':
					typeString = 'INFO';
					textColor = resetColor; // default
					embedColor = `#AAAAAA`;
					break;
				case 'syswarning':
					typeString = 'WARNING';
					textColor = "\x1b[33m"; // yellow
					embedColor = `#fad201`;
					break;
				case 'syserror':
					typeString = 'ERROR';
					textColor = "\x1b[31m"; // red
					embedColor = `#ff4f00#`;
					break;
				default:
					return;
					break;
			};
			
			console.log(textColor + getTimestamp() + ' [' + typeString + '] ' + log + resetColor);
			let embed = new Discord.EmbedBuilder();
			embed.setTitle(kitsune.user.username + ' - Log');
			embed.setColor(embedColor);
			embed.setDescription(getTimestamp());
			embed.addFields([{name: typeString, value: '```\n' + String(log) + '\n```'}]);
			embed.setTimestamp();
			const botowner = await kitsune.users.fetch(values.developers[0]);
			botowner.send({ embeds: [embed] });
			return;
		};
	};
	workfunc(kitsune, type, log, values);
};

class Log {
    constructor(){
		this.perms = [""];
        this.name = "log"; // имя функции
		this.desc = "логирование действий"; // описание функции
    }

    async run(kitsune, type, log, values){
		workfunc(kitsune, type, log, values);
    }
}

module.exports = Log

