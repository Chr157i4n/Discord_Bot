//
// helper functions
//
//
//

var config = require('../config.json');
const logger = require('./logger.js');
//functions_telegram = require('./functions_telegram.js');

/**
 * returns all arguments the user send with the command to the chat
 * @param {object} message the input message from discord.js 
 *
 * @returns {string[]} all arguments in an array
 */
function  getArguments(text) 
{
	const args = text.slice(config.discordprefix.length).split(/\s/);
	args.shift();
	return args;
}

/**
 * returns the command the user send to the discord chat
 * @param {object} message the input message from discord.js 
 *
 * @returns {string} the command
 */
function  getCommand(text) 
{
	var args = text.slice(config.discordprefix.length).split(/\s/);
	args=args.filter(arg => arg!="");
	const command = args.shift().toLowerCase();
	return command;
}

/**
 * returns the complete text after the command as one string
 * @param {object} message the input message from discord.js 
 *
 * @returns {string} the complete text after the command
 */
function  getArgumentString(text) 
{
	const argString = text.slice(config.discordprefix.length+getCommand(text).length+1);
	return argString;
}







module.exports = {
	getArguments,
	getCommand,
	getArgumentString
}