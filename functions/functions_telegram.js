//
// functions
//
//
//
var mTelegramBot;
var mDiscordBot;

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
function setBot(discordBot,telegramBot)
{
mDiscordBot=discordBot;
mTelegramBot=telegramBot;
}


function sendTelegramMessageto(username,text)
{
	item=databaseHelper.searchItems("telegram","discordusername",username);
	mTelegramBot.telegram.sendMessage(item[0].chatid, text);
}

module.exports =
{
    setBot,
    sendTelegramMessageto
};