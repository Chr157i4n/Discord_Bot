// Discord multifunction Bot
//
//
//
// Author: Christian Köhlke
//
//
// Version: V3.0
//
//
//
// Changelog:
//
//
//
//
// Description:
// The Bot answer to a link to a steam game, which would be opened in the browser.
// The Bot then send a message with a link, that opens the shopsite of the game in the Steam-app directly.
//
//
//
// How it works:
//
// Example:
// https://store.steampowered.com/app/397550/Deus_Ex_Revision/
//
// 1. The code searchs for the string "store.steampowered.com" and returns true in line 76.
// 2. the code searchs for the first number in the link, which is "397550" in this example.
// This is the Steam-ID of the game.
// 3. it send a message to the channel with ""steam://advertise/"+ID". In this example: "steam://advertise/397550".
// that link will open the steam-app. First time you need to connect to steam-links to the steam-app in your browser.


var Discord = require('discord.js');
var auth = require('./auth.json');
var config = require('./config.json');
const Telegraf = require('telegraf');
const http = require('http');


const discordBot = new Discord.Client();
const telegramBot = new Telegraf(auth.telegramtoken)


var functions = {};
functions.functions = require('./functions/functions.js');
functions.functions_funfact = require('./functions/functions_funfact.js');
functions.functions_telegram = require('./functions/functions_telegram.js');
functions.functions_discord = require('./functions/functions_discord.js');

const helper = require('./functions/helper.js');
const logger = require('./functions/logger.js');
const databaseHelper = require('./functions/databaseHelper.js');


var newTelegramUser = {};

// vars for TTT_Bot
var guild, channel;
var muted = {};
var get = [];

const { log, error } = console;

const PORT = config.ttt_mute.port; //unused port and since now the OFFICIAL ttt_discord_bot port ;)



function botInit() {
	functions.functions.setBot(discordBot, telegramBot);
	functions.functions_funfact.setBot(discordBot, telegramBot);
	functions.functions_telegram.setBot(discordBot, telegramBot);
	functions.functions_discord.setBot(discordBot, telegramBot, newTelegramUser);

	logger.loggerInit(discordBot, telegramBot, config.logtelegramsendto);

	//TTT_Bot Init
	log('Bot is ready to mute them all! :)');
	guild = discordBot.guilds.get(config.discord.guild);
	//	guild = client.guilds.find('id',config.discord.guild);
	channel = guild.channels.get(config.discord.channel);
	//	channel = guild.channels.find('id',config.discord.channel);
}



/**
 * Discord Bot part
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

discordBot.login(auth.discordtoken);


discordBot.on('ready', () => {
	botInit();
	logger.logInfo('I am ready!');
});


discordBot.on('message', async message => {

	messageHandler(message);

	if (message.author.bot) return;
	if (!message.content.startsWith(config.discordprefix)) return;

	commandHandler(message);

});

discordBot.onerror = function (message) {
	logger.logError(message);
}








/**
 * calls the correct function if a certain message is send to the chat
 * @param {object} message chatmessage from discord.js
 *
 *
 */
async function messageHandler(message) {

	if (message.member) {
		for (item of databaseHelper.getAllItems("telegram")) {
			if (message.content.includes(item.filter)) {
				if (message.content.split(":")[0] == item.discordusername) { continue; }

				telegramMessage = message.content;
				telegramMessage = telegramMessage.replace("<@!" + item.discorduserid + ">", "");
				telegramMessage = telegramMessage.replace("<@" + item.discorduserid + ">", "");
				telegramMessage = telegramMessage.replace(item.discorduserid, "");
				telegramMessage = telegramMessage.trim();
				telegramMessage = message.author.username + ": " + telegramMessage;
				telegramBot.telegram.sendMessage(item.chatid, telegramMessage);
			}
		}
	}

	if (message.author.bot) return;

	if (message.content.includes("steam")) {
		functions.functions.steamlink(message);
	}

	if (message.content.toLowerCase().includes(' hure ') && message.author.username == "Bent") {
		message.channel.send("Ich muss noch lernen");
	}

	if (message.content.toLowerCase().includes('hello there')) {
		message.channel.send("General Kenobi");
	}

	if (message.content.includes("https://img.pr0gramm.com/") || message.content.includes("https://vid.pr0gramm.com/")) {
		var link = await functions.functions.pr0ReverseSearch(message.content);
		message.channel.send(link);
		return;
	}




}

/**
 * calls the correct function if a certain message with the correct prefix is send to the chat
 * @param {object} message chatmessage from discord.js
 *
 *
 */
function commandHandler(message) {
	const command = helper.getCommand(message.content);

	commandfunction = config.commandlist.filter(item => String(item.aliases.filter(item => String(item) == String(command).toLowerCase())).toLowerCase() == String(command).toLowerCase());

	if (commandfunction.length <= 0) { message.channel.send("Kein Befehl gefunden"); return; }

	functions[commandfunction[0].functionnamespace][commandfunction[0].functionname](message);

}












/**
 * Telegram Bot part
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

telegramBot.start(
	(ctx) => {
		newTelegramUser.chatid = ctx.chat.id;
		newTelegramUser.userid = ctx.from.id;

		const discorduser = databaseHelper.searchItems("telegram", "userid", ctx.from.id);
		if (discorduser.length >= 0) { ctx.reply("Dein Account ist bereits verknüpft"); return; }

		//generate a password for the user to activate the account
		newTelegramUser.activationkey = Math.floor(Math.random() * 8999) + 1000;

		ctx.reply(config.telegramstartmessage);
		ctx.reply(newTelegramUser.activationkey);
		return;
	}
);

telegramBot.command('filter',
	(ctx) => {
		item = { "filter": helper.getArgumentString(ctx.message.text) };
		databaseHelper.editItem("telegram", "userid", ctx.from.id, item);
		ctx.reply('dein Filter ist nun abgespeichert');
	}
);

telegramBot.on('message',
	(ctx) => {
		if (!ctx.message.text) return;
		telegramMessage = ctx.message.text;
		if (telegramMessage.slice(0, 1) == "/") return;

		const discorduser = databaseHelper.searchItems("telegram", "userid", ctx.from.id);
		if (discorduser.length <= 0) { ctx.reply("Dein Account ist noch nicht verknüpft"); return; }

		const username = discorduser[0].discordusername;
		var generalChannel = discordBot.channels.get("200724115131203584");
		if (!generalChannel) return;

		generalChannel.send(username + ": " + ctx.message.text);
	}
);

telegramBot.help((ctx) => ctx.reply('keine Ahnung'));
telegramBot.on('sticker', (ctx) => ctx.reply('👍'));
telegramBot.hears('hello there', (ctx) => ctx.reply('General Kenobi'));
telegramBot.launch();

telegramBot.onerror = function (message) {
	logger.logError(message);
}







//
// TTT_Bot
//



discordBot.on('voiceStateUpdate', (oldMember, newMember) => {//player leaves the ttt-channel
	if (oldMember.voiceChannel != newMember.voiceChannel && isMemberInVoiceChannel(oldMember)) {
		if (isMemberMutedByBot(newMember) && newMember.serverMute) newMember.setMute(false).then(() => {
			setMemberMutedByBot(newMember, false);
		});
	}
});

isMemberInVoiceChannel = (member) => member.voiceChannelID == config.discord.channel;
isMemberMutedByBot = (member) => muted[member] == true;
setMemberMutedByBot = (member, set = true) => muted[member] = set;

get['connect'] = (params, ret) => {
	let tag_utf8 = params.tag.split(" ");
	let tag = "";

	tag_utf8.forEach(function (e) {
		tag = tag + String.fromCharCode(e);
	});

	let found = guild.members.filterArray(val => val.user.tag.match(new RegExp('.*' + tag + '.*')));
	if (found.length > 1) {
		ret({
			answer: 1 //pls specify
		});
	} else if (found.length < 1) {
		ret({
			answer: 0 //no found
		});
	} else {
		ret({
			tag: found[0].user.tag,
			id: found[0].id
		});
	}
};

get['mute'] = (params, ret) => {
	let id = params.id;
	let mute = params.mute
	if (typeof id !== 'string' || typeof mute !== 'boolean') {
		ret();
		return;
	}
	log("Muted: " + id);
	//let member = guild.members.find('id', id);
	let member = guild.members.find(user => user.id === id);

	if (member) {

		if (isMemberInVoiceChannel(member)) {
			if (!member.serverMute && mute) {
				if (config.ttt_mute.active) {
					member.setMute(true, "dead players can't talk!").then(() => {
						setMemberMutedByBot(member);
						ret({
							success: true
						});
					}).catch((err) => {
						ret({
							success: false,
							error: err
						});
					});

				}
				else {
					ret({
						success: true
					});
				}
			}
			if (member.serverMute && !mute) {
				member.setMute(false).then(() => {
					setMemberMutedByBot(member, false);
					ret({
						success: true
					});
				}).catch((err) => {
					ret({
						success: false,
						error: err
					});
				});
			}
		}
		else {
			ret();
		}

	} else {
		ret({
			success: false,
			err: 'member not found!' //TODO lua: remove from ids table + file
		});
	}
}


http.createServer((req, res) => {
	if (typeof req.headers.params === 'string' && typeof req.headers.req === 'string' && typeof get[req.headers.req] === 'function') {
		try {
			let params = JSON.parse(req.headers.params);
			get[req.headers.req](params, (ret) => res.end(JSON.stringify(ret)));
		} catch (e) {
			res.end('no valid JSON in params');
		}
	} else
		res.end();
}).listen({
	port: PORT
}, () => {
	log('http interface is ready :)')
});