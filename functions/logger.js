var config = require('../config.json');

var mDiscordBot;
var mTelegramBot;
var mChatID;

function loggerInit(discordBot,telegramBot,chatID)
{
mDiscordBot=discordBot;
mTelegramBot=telegramBot;
mChatID=chatID;
}


function sendTelegramMessageto(text)
{
	mTelegramBot.telegram.sendMessage(mChatID, text);
}


/**
 * 
 * @param {string} text log message
 */
function logInfo(text)
{
	if(config.logconsoleverbosity>=3)  console.log(text);
	if(config.logtelegramverbosity>=3)	sendTelegramMessageto("❕Info: "+text);
}

/**
 * 
 * @param {string} text warning message
 */
function logWarning(text)
{
	if(config.logconsoleverbosity>=2)  console.log(text);
	if(config.logtelegramverbosity>=2)	sendTelegramMessageto("❗Warning: "+text);
}

/**
 * 
 * @param {string} text error message
 */
function logError(text)
{
	if(config.logconsoleverbosity>=1)  console.error(text);
	if(config.logtelegramverbosity>=1)	sendTelegramMessageto("❗❗Error: "+text);
}





module.exports = {
	logInfo,
	logWarning,
    logError,
    loggerInit
}