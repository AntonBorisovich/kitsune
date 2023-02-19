const Discord = require("discord.js");
const request = require("request");
const https = require("https");
const numco = require("numco")
const os = require('os'); // получение данных о системе для генерации useragent

const bbox = "754522.5047236,6680543.9238783,5904162.1488232,10277276.671411" // в каком четырёхугольнике искать машины на карте

// кэш
let cache_cookie = false
let cache_scope = false
let cache_routes = false

// для нормального отображения типа транспорта
let readableType = []
readableType['trolley'] = "Троллейбус"
readableType['bus'] = "Автобус"
readableType['tram'] = "Трамвай"

// типо браузер
let useragent = "Mozilla/5.0 (X11; Linux x86_64; rv:106.0) Gecko/20100101 Firefox/106.0" // defualt agent
if (os.platform().startsWith('win')){
	useragent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
} else if (os.platform().startsWith('linux')) {
	useragent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chromium/108.0.0.0 Safari/537.36"
}
class Orgp {
	constructor(kitsune, commands, values){
		//задать полученые значения для дальнейшего использования в коде команды
		this.values = values;
        this.kitsune = kitsune;
        this.commands = commands;
		this.perms = [];
        this.name = "orgp"; // имя команды
		this.desc = "питерский транспорт"; // описание команды в общем списке команд
		this.advdesc = "Берёт информацию о маршрутах в Санкт-Петербурге со [старого сайта \"Портал Общественного Транспорта Санкт-Петербурга\"](https://transport.orgp.spb.ru/Portal/transport/main).\nФото и данные о машинах предоставляются сайтом [transphoto.org](https://transphoto.org).\n\nСделано специально для <@374144960221413386>"; // описание команды в помоще по конкретной команде
		this.args = "<тип> <номер>"; // аргументы в общем списке команд
		this.argsdesc = "<тип> - троллейбус (тро..), автобус (ав..), трамвай (тра..)\n<номер> - номер маршрута"; // описание аргументов в помоще по конкретной команде
		this.advargs = "<тип> <номер>"; // аргументы в помоще по конкретной команде
    };

    async run(kitsune, msg, args){
		// чекаем аргументы
		let type = false
		let route = false
		args.shift()
		for await (const arg of args) {  
			if (arg.toLowerCase().startsWith('тро') || arg.toLowerCase().startsWith('nhj')) { // троллейбус
				type = "trolley";
			} else if (arg.toLowerCase().startsWith('ав') || arg.toLowerCase().startsWith('fd')) { // автобус
				type = "bus";
			} else if (arg.toLowerCase().startsWith('тра') || arg.toLowerCase().startsWith('nhf')) { // трамвай
				type = "tram";
			} else { // предположительно номер маршрута
				route = arg.toLowerCase();
			};
		};
		
		// проверка наличия маршрута
		if (!route) {
			let embed = new Discord.EmbedBuilder()
			embed.setTitle(kitsune.user.username + ' - orgp')
			embed.setColor(`#F00000`)
			embed.setDescription("Ты не указал маршрут!")
			msg.reply({ embeds: [embed] });
			return;
		}
		
		// проверка наличия кэша
		if (!cache_routes) {
			update_routes(kitsune, msg, args)
		} else {
			//console.log('found routes in cache')
			search_routes(kitsune, msg, args, type, route)
		}

		function search_routes(kitsune, msg, args, type, route) { // поиск по маршруту в кэше
			if (type) { // если указан тип
				if (cache_routes[type+route]) { // если маршрут существует
					get_cock(kitsune, msg, args, cache_routes[type+route].id, route.toUpperCase(), readableType[type]) // начать копать информацию о маршруте с сайта
					return;
				} else { // если не существует то шашипка
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(kitsune.user.username + ' - orgp')
					embed.setColor(`#F00000`)
					embed.setDescription("Мы искали везде, но такого маршрута не знаем.")
					msg.reply({ embeds: [embed] });
				}
			} else { // если тип не указан, то смотреть все типы
				let found = ""
				let embed = new Discord.EmbedBuilder()
				if (cache_routes["trolley"+route]) { // смотрим троллейбусы
					found = found + readableType["trolley"] + " №"+route+"\n"
				}
				if (cache_routes["bus"+route]) { // смотрим автобусы
					found = found + readableType["bus"] + " №"+route+"\n"
				}
				if (cache_routes["tram"+route]) { // смотрим трамваи
					found = found + readableType["tram"] + " №"+route+"\n"
				}
				if (found != "") {
					embed.setTitle(kitsune.user.username + ' - orgp')
					embed.setColor(`#F36B00`)
					embed.setDescription("Вы не указали тип транспорта. Вот что мы нашли по всем типам транспорта:\n\n" + found)
					msg.reply({ embeds: [embed] });
					return;
				} else {
					embed.setTitle(kitsune.user.username + ' - orgp')
					embed.setColor(`#F00000`)
					embed.setDescription("Мы искали везде, но такого маршрута не знаем.")
					msg.reply({ embeds: [embed] });
					return;
				}
			}
		}
		
		function get_cock(kitsune, msg, args, id, routenum, type) { // получить cookie и scope
			//console.log('getting cock')
			const options = { // параметры обращения к серваку
			  uri: 'https://transport.orgp.spb.ru/Portal/transport/route/' + id,
			  headers: {
				"authority": "transport.orgp.spb.ru",
				"scheme": "https"
			  }
			};
			request.get(options, (err, res, body) => { // обращаемся к серваку
				
				if (body) {
					if (body.indexOf('scope: "') != -1) { // если есть scope, то обрезать и запомнить
						cache_scope = body.slice(body.indexOf('scope: "')+8)
						cache_scope = cache_scope.slice(0, cache_scope.indexOf('"'))
						cache_scope = cache_scope.replace(/\+/g, "%2B")
					};
				} else {
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(kitsune.user.username + ' - orgp')
					embed.setColor(`#F00000`)
					embed.setDescription("Что-то пошло не так. Не удалось получить данные")
					msg.reply({ embeds: [embed] });
					return;
				}
				if (res) {
					if (res.rawHeaders) {
						if (String(res.rawHeaders).indexOf('JSESSIONID=')) { // если сайт выдал cookie, то обрезать и запомнить
							cache_cookie = String(res.rawHeaders);
							cache_cookie = cache_cookie.slice(cache_cookie.indexOf('JSESSIONID=')+11);
							cache_cookie = cache_cookie.slice(0, cache_cookie.indexOf(';'));
						} else {
							console.log('no cookie');
							return;
						};
					} else {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(kitsune.user.username + ' - orgp')
						embed.setColor(`#F00000`)
						embed.setDescription("Что-то пошло не так. Не удалось получить данные")
						msg.reply({ embeds: [embed] });
						return;
					}
				} else {
					let embed = new Discord.EmbedBuilder()
					embed.setTitle(kitsune.user.username + ' - orgp')
					embed.setColor(`#F00000`)
					embed.setDescription("Что-то пошло не так. Не удалось получить данные")
					msg.reply({ embeds: [embed] });
					return;
				};
				get_cars_on_route(kitsune, msg, args, id, routenum, type) // чекаем на сайте какие машины на маршруте
			});
		};
		function get_cars_on_route(kitsune, msg, args, id, routenum, type) { // получить список машин на маршруте (обязательно в кэше должен быть scope и cookie)
			function compare(field, order) {
					return (a, b) => (a[field] < b[field] && -1) || (a[field] > b[field] && 1) || 0;
			}
			const options = { // параметры обращения к серваку
			  uri: 'https://transport.orgp.spb.ru/Portal/transport/mapx/innerRouteVehicle?ROUTE=' + id + "&SCOPE=" + cache_scope + "&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&LAYERS=&WHEELCHAIRONLY=false&BBOX=" + bbox,
			  headers: {
				"cookie": "JSESSIONID=" + cache_cookie, // это кот куки
				"authority": "transport.orgp.spb.ru",
				"scheme": "https"
			  }
			};
			request.get(options, (err, res, body) => { // обращаемся к серваку
				if (body) {
					let bus = false
					let ccars_list = []
					let ccars_menulist = []
					let ccars_labels = []
					let ccars = JSON.parse(body) // парсим инфу
					let embed = new Discord.EmbedBuilder()
					if (!ccars.features[0]) {
						embed.setTitle(kitsune.user.username + ' - orgp')
						embed.setColor(`#F00000`)
						embed.setDescription("Ни одной машины сейчас нету на маршруте")
						msg.reply({ embeds: [embed] });
						return;
					}
					ccars.features.forEach((car) => { // чекаем все машины и пишем в список
						//console.log(car)
						let wheel = ""
						if (car.properties.wheelchair) {
							wheel = " ♿"
						}
						if (car.properties.transportTypeId == "trolley") {
							ccars_labels.push(car.properties.label)
							ccars_menulist.push({label: car.properties.label, description: "", value: car.properties.transportTypeId + "_" + car.properties.label})
							ccars_list.push("[" + car.properties.label + wheel + "](https://transphoto.org/api.php?action=index-qsearch&cid=2&type=2&num=" + car.properties.label + ")")
						} else if (car.properties.transportTypeId == "tram") {
							ccars_labels.push(car.properties.label)
							ccars_menulist.push({label: car.properties.label, description: "", value: car.properties.transportTypeId + "_" + car.properties.label})
							ccars_list.push("[" + car.properties.label + wheel + "](https://transphoto.org/api.php?action=index-qsearch&cid=2&type=1&num=" + car.properties.label + ")")
						} else {
							bus = true
							ccars_list.push(car.properties.label + wheel)
						};
					})
					
					ccars_list.sort()
					ccars_list = ccars_list.join("\n")
					ccars_labels.sort()
					
					embed.setTitle(kitsune.user.username + ' - orgp')
					embed.setColor(`#F36B00`)
					embed.setDescription("Вот машины (" + ccars.features.length + " шт) на маршруте " + routenum + " (" + type + "):\n**" + ccars_list + "**\n\nКарта: [🆕 Новый сайт](https://transport.orgp.spb.ru/routes/" + id +") / [🧓 Старый сайт](https://transport.orgp.spb.ru/Portal/transport/route/" + id +")")
					if (ccars_labels.length > 25 || ccars.features > 25) {
						ccars_labels = ccars_labels.slice(0,25)
						//console.log(ccars_labels)
						ccars.features = ccars.features.slice(0,25)
						//console.log(ccars.features)
						embed.setFooter({ text: "На маршруте сейчас много машин, так что, к сожалению, в списке ниже возможно выбрать только первые 25" })
					}
					if (!bus) { // если не автобус то добавить возможность смотреть доп. инфу на transphoto.org
						let list = new Discord.StringSelectMenuBuilder()
						list.setCustomId(msg.author.id + "_0_orgp_getstts")
						list.setPlaceholder('Получить больше инфы о...')
						ccars_labels.forEach((car) => {
							list.addOptions({
								label: String(car),
								value: String(ccars.features[0].properties.transportTypeId + "_" + car + "_" + numco.compress(ccars_labels))
							});
						});
						
						let row = new Discord.ActionRowBuilder().addComponents(list);
						
						msg.reply({ embeds: [embed], components: [row] });
					} else { // если автобус то ничего не мудрить
						msg.reply({ embeds: [embed] });
					}
				}
			});
		}
		function update_routes(kitsune, msg, args) {
			const bodymine ="sEcho=0&"+ // ?
							"iColumns=3&"+ // кол-во столбцов с информацией
							"sColumns=id,transportType,routeNumber&"+ // содержание столбцов (какое кол-во столько и пунктов)
							"iDisplayStart=0&"+ // ?
							"iDisplayLength=800&"+ // сколько выпукнуть
							"sNames=id,transportType,routeNumber&"+ // тоже самое, что и sColumns
							"iSortingCols=1&"+ // ?
							"iSortCol_0=2&"+ // по какой колонке сортировать
							"sSortDir_0=asc&"+ // ?
							"bSortable_0=true&"+ // сортировать ли
							"bSortable_1=true&"+ // сортировать ли
							"bSortable_2=true&"+ // сортировать ли
							"transport-type=0&"+ // отображать ли этот тип транспорта
							"transport-type=2&"+ // отображать ли этот тип транспорта
							"transport-type=1" // отображать ли этот тип транспорта
				
			//const bodysite = "sEcho=2&iColumns=11&sColumns=id%2CtransportType%2CrouteNumber%2Cname%2Curban%2CpoiStart%2CpoiFinish%2Ccost%2CforDisabled%2CscheduleLinkColumn%2CmapLinkColumn&iDisplayStart=0&iDisplayLength=25&sNames=id%2CtransportType%2CrouteNumber%2Cname%2Curban%2CpoiStart%2CpoiFinish%2Ccost%2CforDisabled%2CscheduleLinkColumn%2CmapLinkColumn&iSortingCols=1&iSortCol_0=2&sSortDir_0=asc&bSortable_0=true&bSortable_1=true&bSortable_2=true&bSortable_3=true&bSortable_4=true&bSortable_5=true&bSortable_6=true&bSortable_7=true&bSortable_8=true&bSortable_9=false&bSortable_10=false&transport-type=0&transport-type=2&transport-type=1"
			const options = { // параметры обращения к серваку
			  hostname: 'transport.orgp.spb.ru',
			  port: 443,
			  path: '/Portal/transport/routes/list',
			  method: 'POST',
			  headers: {
				//"cookie": "JSESSIONID=" + sessionid,
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8"
			  },
			}
			const reqr = https.request(options, (res) => { // обращаемся к серваку
				//console.log('connected')
				//console.log(res)
				let data = ""
				res.on('data', (d) => {
					data = data + d
				});
				res.on('end', () => {
					if (data) {
						//console.log(data)
						if (data.indexOf("405 Not Allowed") != -1) {
							let embed = new Discord.EmbedBuilder()
							embed.setTitle(kitsune.user.username + ' - orgp')
							embed.setColor(`#F00000`)
							embed.setDescription("На сервере ведутся работы! Попробуйте позже!")
							msg.reply({ embeds: [embed] });
							cache_routes = false
							return;
						};
						cache_routes = [];
						let rroutes = JSON.parse(data).aaData
						rroutes.forEach((route) => {
							cache_routes[route[1].systemName+route[2].toLowerCase()] = {
								"id": route[0],
								"type": route[1].systemName
							}
						});
						search_routes(kitsune, msg, args, type, route);
						return;
					} else {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(kitsune.user.username + ' - orgp')
						embed.setColor(`#F00000`)
						embed.setDescription("Ни одной машины сейчас нету на маршруте")
						msg.reply({ embeds: [embed] });
						return;
					}
				})
			});
			reqr.on('error', (e) => {
			  console.error(e);
			});
			reqr.write(bodymine); // пишем данные в сайт
			reqr.end();
		};
	};
	async butt(kitsune, interaction, args){
		if (interaction.values[0]) {
			get_stts_vehicle(kitsune, interaction, args, interaction.values[0].split("_"))
		} else {
			return;
		};
		function get_stts_vehicle(kitsune, interaction, args, vallu) { // get last photo from transphoto.org
		
			// types
			//
			// 1 - tram
			// 2 - trolleybus
			
			// bus is not supported on this site!
			let numtype
			if (vallu[0] == "tram") {
				numtype = 1;
			} else if (vallu[0] = 'trolley') {
				numtype = 2;
			} else {
				console.log('no you cant search that type of transphoto.org ')
				return;
			}
			const options = { // параметры обращения к серваку
			  uri: 'https://transphoto.org/api.php?action=index-qsearch&cid=2&type=' + numtype + '&num=' + vallu[1],
			  headers: {
				"authority": "transphoto.org",
				"scheme": "https"
			  }
			};
			request.get(options, (err, res, body) => { // обращаемся к серваку
				if (body) {
					if (body.indexOf('href') != -1) {
						let vehicle_page = body.slice(body.indexOf('href')+6)
						vehicle_page = vehicle_page.slice(0, vehicle_page.indexOf('"'))
						vehicle_page = 'https://transphoto.org' + vehicle_page
						get_stts_photodate(kitsune, interaction, args, vallu, vehicle_page)
					} else {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(kitsune.user.username + ' - orgp')
						embed.setColor(`#F00000`)
						embed.setDescription('Не удалось получить информацию о ' + vallu[1])
						interaction.reply({ embeds: [embed]})
						return;
					}
				} else {
					embed = new Discord.EmbedBuilder()
					embed.setTitle(kitsune.user.username + ' - orgp')
					embed.setColor(`#F00000`)
					embed.setDescription('Не удалось получить информацию о ' + vallu[1])
					interaction.reply({ embeds: [embed]})
					return;
				}
			});
		};
		
		function get_stts_photodate(kitsune, msg, args, vallu, link) { // get last photo data from transphoto.org vehicle page
			msg.deferUpdate();
			const options = { // параметры обращения к серваку
			  uri: link,
			  headers: {
				"authority": "transphoto.org",
				"scheme": "https"
			  }
			};
			request.get(options, (err, res, body) => { // обращаемся к серваку
				if (body) {
					let model_info = false
					let park_info = false
					let park_link = false
					let photo_place = false
					let photo_date = false
					let photo_author = false
					let photo_link = false
					let photo_img = false
					
					if (body.indexOf('<a href="/model/') != 1) {
						model_info = body.slice(body.indexOf('<a href="/model/'))
						model_info = model_info.slice(model_info.indexOf('/">')+3,model_info.indexOf('</b>'))
					};
					if (body.indexOf('<a href="/list.php?did=') != 1) {
						park_info = body.slice(body.indexOf('<a href="/list.php?did='))
						park_info = park_info.slice(park_info.indexOf('">')+2,park_info.indexOf('</a>'))
					};
					if (body.indexOf('<a href="/list.php?did=') != 1) {
						park_link = body.slice(body.indexOf('<a href="/list.php?did=')+9, )
						park_link = park_link.slice(0,park_link.indexOf('">'))
						if (park_link.length > 64) {
							park_link = "https://youtu.be/dQw4w9WgXcQ"
						}
					};
					if (body.indexOf('<b class="pw-place">') != 1 ) { 
						photo_place = body.slice(body.indexOf('<b class="pw-place">')+20)
						photo_place = photo_place.slice(0,photo_place.indexOf('</b>'))
						photo_place = photo_place.replace(/&quot;/g, '"')
						photo_place = photo_place.replace(/<img src=\"\/img\/place_arrow.gif\" alt=\"→\" width=\"15\" height=\"11\" style=\"position:relative; top:-1px; margin:0 3px\">/g, '▶')
						if (photo_place.length > 196) {
							photo_place = "нету"
						}
					}
					if (body.indexOf('<p class="sm"><b>') != 1 ) { 
						photo_date = body.slice(body.indexOf('<p class="sm"><b>')+17)
						photo_author = photo_date.slice(photo_date.indexOf('<a gref=')+8, photo_date.indexOf('</a>'))
						photo_author = photo_author.slice(photo_author.indexOf('/">')+3)
						if (photo_author.length > 64) {
							photo_author = "*(не получилось узнать)*"
						}
						photo_date = photo_date.slice(0,photo_date.indexOf('</b>'))
						if (photo_date.length > 64) {
							photo_date = "нету"
						}
					};
					if (body.indexOf('<td class="pb_photo">') != 1 ) { 
						photo_img = body.slice(body.indexOf('<td class="pb_photo">')+21)
						
						photo_link = photo_img.slice(photo_img.indexOf('<a href="')+9)
						photo_link = photo_link.slice(0, photo_link.indexOf('"'))
						photo_link = 'https://transphoto.org' + photo_link
						if (photo_link.length > 128) {
							photo_link = "https://youtu.be/dQw4w9WgXcQ"
						}
						
						photo_img = photo_img.slice(photo_img.indexOf('<img class="f" src="')+20)
						photo_img = photo_img.slice(0, photo_img.indexOf('" alt'))
						photo_img = 'https://transphoto.org' + photo_img
						photo_img = photo_img.replace(/_s/g, "")
						if (photo_img.length > 128) {
							photo_img = "https://i.imgur.com/oJGKR0l.png"
						}
					};
					if (model_info && park_info && park_link && photo_place && photo_date && photo_author && photo_link && photo_img) {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(kitsune.user.username + ' - orgp')
						embed.setColor(`#F36B00`)
						embed.setDescription("[**" + model_info + " №" + vallu[1] + "**](" + photo_link + ")\n[" + park_info +"](https://transphoto.org" + park_link + ")")
						embed.addFields({ name: "Последнее фото №" + vallu[1] + " на transphoto.org", value: "Улица: " + photo_place + "\nДата: " + photo_date + "\nАвтор: " + photo_author})
						embed.setImage(photo_img)
						
						let list = new Discord.StringSelectMenuBuilder()
						list.setCustomId(msg.customId + "1")
						list.setPlaceholder('Получить больше инфы о...')
						numco.decompress(vallu[2]).forEach((car) => {
							if (car != "") {
								list.addOptions({
									label: String(car),
									value: String(vallu[0] + "_" + car + "_" + vallu[2])
								});
							}
						});
						
						let row = new Discord.ActionRowBuilder().addComponents(list);
						msg.message.edit({ embeds: [embed], components: [row] });
					} else {
						let embed = new Discord.EmbedBuilder()
						embed.setTitle(kitsune.user.username + ' - orgp')
						embed.setColor(`#F00000`)
						embed.setDescription("Ну удалось получить данные о " + label)
						msg.reply({ embeds: [embed] });
					}
					
					
				}
				//get_cars_on_route(kitsune, msg, args, id)
			});
		};
		
	}
};

module.exports = Orgp;

