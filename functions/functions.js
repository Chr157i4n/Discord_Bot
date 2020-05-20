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

/**
 * 
 * @param {string} message no Parameter needed
 */
async function dog(message) {

	await fetch('https://random.dog/woof.json')
		.then(response => response.json())
		.then((json) => { dogJSON = json });

	message.channel.send(dogJSON.url);

}

/**
 * 
 * @param {string} message no Parameter needed
 */
async function cat(message) {

	await fetch('https://api.thecatapi.com/v1/images/search?format=json')
		.then(response => response.json())
		.then((json) => { catJSON = json });;

	message.channel.send(catJSON[0].url);

}

/**
 * 
 * @param {string} args can be in any order. should contain a aliasname of one discorduser
 * 
 */
function summon(message) {
	const args = helper.getArguments(message.content);

	for (var arg of args) {
		var user=databaseHelper.searchItems("user","aliases",arg);
		if(user.length<=0) {message.channel.send("Keine Person mit diesem Alias gefunden"); return;}
		var item=databaseHelper.searchItems("summontexts","markedusername",user[0].discordusername);


		
		if(!item) 			{ message.channel.send("Diese Person kann aktuell nicht herbeigerufen werden"); return; }
		if(item.length<=0) 	{ message.channel.send("Diese Person kann aktuell nicht herbeigerufen werden"); return; }
		
		message.channel.send(item[0].markedusertext+" "+item[0].text);



		telegramuser=databaseHelper.searchItems("telegram","discorduserid",item[0].markeduserid);

		if(!telegramuser) 				{ console.log("Kein Telegramuser gefunden.1"); return; }
		if(telegramuser.length<=0) 		{ console.log("Kein Telegramuser gefunden.2"); return; }

		mTelegramBot.telegram.sendMessage(telegramuser[0].chatid, item[0].text);
		
	}

}

/**
 * 
 * @param {string} message no Parameter needed
 */
function stefan(message) {
	var messageString = "Downloadlink für Total War: Medieval 2:\nhttps://studhsemdenleerde-my.sharepoint.com/:u:/g/personal/christian_koehlke_stud_hs-emden-leer_de/EaFwlgLTYDRLn9-cXKpAftMBmS3_tllPSr6-ssgN-qje-w?e=RcKgJw\n\nAnleitung zum Entpacken von Zip-Dateien:\nhttps://www.jura.uni-frankfurt.de/44259973/Anleitung_7_ZIP.pdf";

	message.channel.send(messageString);

}

/**
 * 
 * @param {string} message no Parameter needed
 */
function help(message) {
	var messageString = "Mögliche Befehle:\n";
	messageString += "!dog: zeigt ein zufälliges Hundebild\n";
	messageString += "!cat: zeigt ein zufälliges Katzenbild\n";
	messageString += "!summon Bent [Paramter: Name]: schickt eine Nachricht in den Chat, um die jeweilige Person herbei zu beschwören\n";
	messageString += "!stefan: schick eine Anleitung zum Runterladen von Total War: Medieval 2 in den Chat\n";
	messageString += "!help: zeigt alle Befehle mit Erklärung an\n";
	messageString += "!pr0: top=1 user=cha0s tag=afd [Parameter: top, user, tag, help, novid, random (alle optional),(Paramter ohne identifier werden als Tags berücksichtigt)] zeigt den neusten Post zu den gegebenen Bedingungen an\n";

	messageString += "\n";
	messageString += "Zusätzliche Funktionen:\n";
	messageString += "Steam-Link-Helper: postet zu einem Steam-Web-Link den passenden Steam-Browser-Protokoll-Link\n";
	messageString += "Pr0gramm-Link-Helper: führt eine Reverse-Search zu einem img. und vid. Link durch und postet den Link zum Beitrag\n";
	message.channel.send(messageString);

}

/**
 * 
 * @param {string} message complete message. should contain a steam weblink
 * 
 */
function steamlink(message) {


	//specifiy the links which should trigger the Bot
	var sendIfContains = ['store.steampowered.com', 'steamcommunity.com'];
	//specifiy those links, which the Bot should ignore
	var dontSendIfContains = ['sharedfiles'];




	// check, if one of the items of "sendIfContains" is included in the Message
	for (var sendIfContainsItem of sendIfContains) {
		var sendItemIncluded = message.content.includes(sendIfContainsItem);
		console.log('Included:' + sendItemIncluded);
		console.log('sendIfContainsItem:' + sendIfContainsItem);
		if (sendItemIncluded == true) break;
	}
	// Send an Answer if this is true



	// check, if one of the items of "dontSendIfContains" is included in the Message
	for (var dontSendIfContainsItem of dontSendIfContains) {
		var dontSendItemIncluded = message.content.includes(dontSendIfContainsItem);
		console.log('Included:' + dontSendItemIncluded);
		console.log('sendIfContainsItem:' + dontSendIfContainsItem);
		if (dontSendItemIncluded == true) break;
	}
	// Dont send an answer if this is true



	if (sendItemIncluded === true && dontSendItemIncluded === false) {
		console.log('sendItemIncluded==true  AND  dontSendItemIncluded==false');
		//there is a steam link in the message
		//search for ID 
		var regex = /\d+/; //search for a number
		var match = message.content.match(regex);  // creates array from matches
		// first match should be the steam ID, like:
		// https://store.steampowered.com/app/397550/Deus_Ex_Revision/


		if (match != null) {
			console.log('ID found');
			//If there is a number in the link, it should be the steam-id of the game.
			var ID = match;

			// This is the answer-message the bot sends:
			var messageString = "Steam-Shop-Link:\nsteam://advertise/" + ID + "\nSteam-Community-Link:\nsteam://url/gamehub/" + ID + "\n :link:";

			// It looks like this:

			//Steam-Shop-Link:
			//steam://advertise/753912231
			//Steam-Community-Link:
			//steam://url/gamehub/753912231
			//:link:

			//:link: is the link Emoji in Discord.

			//This sends the answer to the channel the original message was send to.
			message.channel.send(messageString);
		}
		else {
			//The link contains no number
			//var messageString=user+", du Hure!!!"

			//message.channel.send(messageString);

			message.reply("Du Hure!!!")
		}
	}
}

/**
 * 
 * @param {string} videoLink direct link to the video or image from pr0gramm
 * 
 */
async function pr0ReverseSearch(videoLink) {

	var videoPath = videoLink.trim();
	var videoPath = videoPath.replace("https://img.pr0gramm.com/", "");
	var videoPath = videoPath.replace("https://vid.pr0gramm.com/", "");

	//https://pr0gramm.com/new/!p:2016/06/08/404c90a0b217cea3.mp4
	//url="https://img.pr0gramm.com/2016/09/02/fa714f1689d51779.mp4";
	//urlshort="/2016/09/02/fa714f1689d51779.mp4";

	var pr0JSON;
	var baseURL = "https://pr0gramm.com/api/items/get";
	var QueryString = "?flags=1&tags=!p:" + videoPath;

	console.log("URL: " + baseURL + QueryString);

	await fetch(baseURL + QueryString)
		.catch(err => console.error(err))
		.then(response => response.json())
		.then((json) => { pr0JSON = json });



	if (!pr0JSON.items) {
		var returnMessage = "";
		if (pr0JSON.error) returnMessage += pr0JSON.error;
		if (pr0JSON.msg) returnMessage += pr0JSON.msg;
		return returnMessage;
	}
	if (!pr0JSON.items.length > 0) {
		return "Keine Ergebnisse gefunden";
	}

	var itemNO = 0;
	console.log(pr0JSON.items[itemNO]);

	var returnMessage = "https://pr0gramm.com/new/" + pr0JSON.items[itemNO].id;

	return returnMessage;
}

/**
 * 
 * @param {string} args can be in any order: top=, tag=, benis>, user=, random, novid, reverse, help
 * 
 */
async function pr0Search(message) {

	var QueryStringUser = "", QueryStringTags = [], QueryStringTop = -1, QueryStringBenis = -1;
	var random = false,noVid=false;
	var pr0JSON;
	var baseURL = "https://pr0gramm.com/api/items/get";
	const args = helper.getArguments(message.content);

	for (var arg of args) {
		console.log('current arg: ' + arg);

		if (arg.includes("user=")) {
			QueryStringUser = arg.substr(5);
		}

		else if (arg.includes("tag=")) {
			var tag = arg.substr(4);
			QueryStringTags.push(tag);
		}

		else if (arg.includes("benis>")) {
			QueryStringBenis = arg.substr(6);
			rest=Math.abs(parseInt(QueryStringBenis)%100);
			if (rest!=0)
			{
				return "Für den Benis sind nur 100er Schritte erlaubt";
			}
		}

		else if (arg.includes("top=")) {
			QueryStringTop = arg.substr(4);
		}

		else if (arg.includes("random")) {
			random = true;
		}

		else if (arg.includes("novid")) {
			noVid = true;
		}
		else
		{
			QueryStringTags.push(arg);	
		}


	}

	var QueryString = "?flags=1&";
	if (QueryStringUser) QueryString += "user=" + QueryStringUser + "&";
	if (QueryStringTop != -1) QueryString += "promoted=" + QueryStringTop + "&";
	if (QueryStringBenis != -1 || QueryStringTags.length > 0 || noVid) QueryString += "tags=";
	if (QueryStringBenis != -1 || noVid) QueryString += "!";
	for (var tag of QueryStringTags) { QueryString += "+" + tag; }
	if (QueryStringBenis != -1) QueryString += "+s:" + QueryStringBenis;
	if (noVid) QueryString += "+-\"video\"";


	console.log("URL: " + baseURL + QueryString);

	await fetch(baseURL + QueryString)
		.catch(err => console.error(err))
		.then(response => response.json())
		.then((json) => { pr0JSON = json });


	//if (noVid)
	//{
	//	pr0JSON.items=pr0JSON.items.filter(item =>  !item.image.includes("mp4") || !item.image.includes("webm"));
	//}


	if (!pr0JSON.items) {
		if (pr0JSON.error) return pr0JSON.error;
		if (pr0JSON.msg) return pr0JSON.msg;
		return "unbekannter Fehler";
	}
	if (!pr0JSON.items.length > 0) {
		return "Keine Ergebnisse gefunden";
	}

	var itemNO = 0;
	if (random) itemNO = Math.floor(Math.random() * Math.floor(pr0JSON.items.length));

	console.log(itemNO);
	console.log(pr0JSON.items[itemNO]);

	return pr0JSON.items[itemNO];
}

/**
 * 
 * @param {string} args can be in any order: top=, tag=, benis>, user=, random, novid, reverse, help
 * 
 */
async function pr0(message) {
	const args = helper.getArguments(message.content);

	if (args == "help") {
		message.channel.send("mögliche Parameter:\nuser=cha0s\ntag=afd\ntop=1\nrandom\nnovid\nreverse img.programm.com/...\n");
		return;
	}


	if (args.lenght > 0) {
		if (args[0].includes("reverse")) {
			var videoLink;

			if (args[0].includes("reverse=")) {
				videoLink = args[0].substr(8);
			}
			else {
				videoLink = args[1];
			}

			var link = await pr0ReverseSearch(videoLink);
			message.channel.send(link);
			return;
		}
	}



	else {

		var item = await pr0Search(message);

		if(!item) {message.channel.send("Kein Ergebnis"); return;}
		if(!item.id) {message.channel.send(item); return;}
		message.channel.send("https://img.pr0gramm.com/" + item.image);
		message.channel.send("https://pr0gramm.com/new/" + item.id);
	}

}

/**
 * 
 * @param {string} first_arg username to which the alias should be added
 * @param {string} second_arg alias that should be added
 */
function addAlias(message) {
	args=helper.getArguments(message.content);
	if (!args) {return;};
	if (args.length<2) {message.reply("Der Befehl benötigt 2 Paramter: Username Alias"); return;};

	const username=args[0];
	const newAlias=args[1];

	var user=databaseHelper.searchItems("user","discordusername",username);

	if(user.length==1)
	{
		//existing user
		var aliasuser=databaseHelper.searchItems("user","aliases",newAlias);
		if(aliasuser.length>0) {message.reply("Alias bereits vorhanden"); return;};

		user[0].aliases.push(newAlias);

		databaseHelper.editItem("user","discordusername",username,user[0]);



	} else if(user.length==0) {
		//new user
		user={};
		user.discordusername=username;
		user.aliases=[username,newAlias];

		databaseHelper.addItem("user",user);

	} else {
		console.error("Benutzername mehrmals in Datenbank");
	}
	

	message.reply("Alias gespeichert");

}

function showAlias(message){
	args=helper.getArguments(message.content);

	if (!args) {return;};
	if (args.length<1) {message.reply("Der Befehl benötigt 1 Paramter: Name"); return;};

	const name=args[0];

	var user=databaseHelper.searchItems("user","aliases",name);

	if(user.length>=1)
	{
		message.reply("Mögliche Aliase: " + user[0].aliases);
	}
}

function ttt_mute_deactivate(message){
	config.ttt_mute.active=false;
	message.reply("TTT-Mute-Funktion ist jetzt aus");
}

function ttt_mute_activate(message){
	config.ttt_mute.active=true;
	message.reply("TTT-Mute-Funktion ist jetzt an");
}

module.exports =
{
	setBot,
	dog,
	cat,
	summon,
	stefan,
	help,
	steamlink,
	pr0,
	pr0ReverseSearch,
	addAlias,
	showAlias,
	ttt_mute_deactivate,
	ttt_mute_activate
};

