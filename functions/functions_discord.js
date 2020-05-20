//
// functions
//
//
//
var mTelegramBot;
var mDiscordBot;

var mNewTelegramUser;

const fetch = require('node-fetch');
var config = require('../config.json');
const fs = require('fs');
const helper = require('./helper.js');
const databaseHelper = require('./databaseHelper.js');
const logger = require('./logger.js');

/**
 * internal function
 * 
 */
function setBot(discordBot,telegramBot, newTelegramUser)
{
mDiscordBot=discordBot;
mTelegramBot=telegramBot;
mNewTelegramUser=newTelegramUser;
}

async function activateTelegramConnection(message)
{
    if (!message.member) { message.reply("nicht im Privatchat erlaubt"); return; }
	if (!message.member.roles.has(config.roleIDs.freund)) { message.reply("fehlende Berechtigung"); return; }

    arg=helper.getArgumentString(message.content);
    if(arg!=mNewTelegramUser.activationkey) {message.reply("falsches Passwort"); return;}


    mNewTelegramUser.discorduserid=message.author.id;
    mNewTelegramUser.discordusername=message.author.username;
    mNewTelegramUser.filter=message.author.id;
    delete mNewTelegramUser.activationkey;

    databaseHelper.addItem("telegram",mNewTelegramUser);
    message.reply("Telegram Account erfolgreich verknüpft");
    //mTelegramBot.telegram.sendMessage(mNewTelegramUser.chatID, config.telegramwelcomemessage);

    mNewTelegramUser={};

}


module.exports =
{
    setBot,
    activateTelegramConnection
};

