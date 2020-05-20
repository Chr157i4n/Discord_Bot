//
// funfact functions
//
//
//

var mDiscordBot;
var mTelegramBot;

var config = require('../config.json');

const helper = require('./helper.js');
const databaseHelper = require('./databaseHelper.js');
const logger = require('./logger.js');

/**
 * internal function
 * 
 */
function setBot(discordBot,telegramBot)
{
mDiscordBot=discordBot;
mTelegramBot=telegramBot;
}

/**
 * shows a random funfact
 * the arguments are used to filter the funfacts. 
 * afterwards a random one is picked from the remaining
 * @param {object} message chatmessage from discord.js
 *
 *
 */
function funfactShow(message) {
	args = helper.getArguments(message.content);
	var funfacts=[];
	if (args.length > 0) {
		funfacts=databaseHelper.searchItems("funfacts","markedusername",args[0]);
	} else {
		funfacts=databaseHelper.getAllItems("funfacts");
	}

 	if (funfacts.length <= 0) { message.channel.send("Keinen passenden Funfact gefunden"); return; }

	var randomNumber = Math.floor(Math.random() * Math.floor(funfacts.length));

	messageString = "[" + funfacts[randomNumber].index + "] " + funfacts[randomNumber].text;

	message.channel.send(messageString);

}

/**
 * adds a funfact.
 * the text of it is the complete line after the command
 * @param {object} message chatmessage from discord.js
 *
 *
 */
async function funfactAdd(message) {
	//control rights of the user
	if (!message.member) { message.reply("nicht im Privatchat erlaubt"); return; }
	if (!message.member.roles.has(config.roleIDs.freund)) { message.reply("fehlende Berechtigung"); return; }


	//read the funfact
	var markedUserText = "", markedUserID = "", markedUserName = "";
	var funfactText = helper.getArgumentString(message.content);

	if (message.content.includes("<@!") && message.content.includes(">")) {
		var markStart = message.content.search("<@!");
		var markEnd = message.content.search(">");

		markedUserText = message.content.substring(markStart, markEnd + 1);
		markedUserID = markedUserText.substring(3, markedUserText.length - 1);

		markedUser = await mDiscordBot.fetchUser(markedUserID);
		markedUserName = markedUser.username;
	}
	if (message.content.includes("-")) {
		var deleteEnd = funfactText.search("-");
		funfactText = funfactText.substring(0, deleteEnd);
	}
	funfactText = funfactText.trim();

	//create the funfact JSON-entry
	funfact =
	{
		"markedusertext": markedUserText,
		"markeduserid": markedUserID,
		"markedusername": markedUserName,
		"text": funfactText
	};

	//add the funfact to the database
	databaseHelper.addItem("funfacts",funfact);

}

/**
 * deletes a funfact
 * the first argument is used as a index, which funfact should be deleted
 * @param {object} message chatmessage from discord.js
 *
 *
 */
function funfactDel(message) {
	const args = helper.getArguments(message.content)[0];

	if (args.length === 0) { message.channel.send("kein Parameter gefunden"); return };
	if (args[0].length === 0) { message.channel.send("kein Parameter gefunden"); return };
	if (isNaN(args[0])) { message.channel.send("Parameter ist keine Zahl"); return };
	if (message.author.username != "Chr15714n") { message.channel.send("fehlende Berechtigung"); return };

	databaseHelper.deleteItem("funfacts",args);

}


module.exports = {
	funfactShow,
	funfactAdd,
	funfactDel,
	setBot
};