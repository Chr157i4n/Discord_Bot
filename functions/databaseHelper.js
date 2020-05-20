//
// databaseHelper functions
//
//
//


//Config-file
var config = require('../config.json');
//Libary for reading/writing files
const fs = require('fs');
const helper = require('./helper.js');
const logger = require('./logger.js');

//
// PUBLIC FUNCTIONS
//
//
//


/**
 * searchs for items in the given sub-database
 * @param {string} subDataBaseName name of the sub-database 
 * @param {string} param which parameter of the database should be compared with the query
 * @param {int} query value to compare to the param of the database
 *
 * @returns {object} the machting sub-database entries. false, if something went wrong
 */
function searchItems(subDataBaseName, param, query) {
    //read database
    subDataBase = readDatabase(subDataBaseName);
    if (!subDataBase) return false;

    //manipulate data
    logger.logInfo("searching for data in database: "+subDataBaseName+" param: "+param+" query: "+query);
    subDataBase = subDataBase.filter(item => String(item[param]).toLowerCase().includes(String(query).toLowerCase()));

    if (!subDataBase) {
        console.log("no Item found");
        return false;
    } else {
        logger.logInfo("Items found: "+subDataBase);
        return subDataBase;
    }
}



/**
 * returns the item with the given index
 * @param {string} subDataBaseName name of the sub-database 
 * @param {int} index index wich item should be returned
 * 
 * @returns {object} the machting sub-database entry. false, if something went wrong
 */
function getItem(subDataBaseName, index) {
    //read database
    subDataBase = readDatabase(subDataBaseName);
    if (!subDataBase) return false;

    //manipulate data
    logger.logInfo("searching in database: "+subDataBaseName+" for index: "+index);
    subDataBase = subDataBase.filter(item => item.index == index);

    if (!subDataBase) {
        logger.logInfo("no Item found");
        return false;
    } else {
        logger.logInfo("Item found: "+subDataBase);
        return subDataBase;
    }
}



/**
 * returns all items if the sub-database
 * @param {string} subDataBaseName name of the sub-database 
 * 
 * @returns {object} the complete sub-database. false, if something went wrong
 */
function getAllItems(subDataBaseName) {
    //read database
    logger.logInfo("getting all items from subdatabase: "+subDataBaseName);

    subDataBase = readDatabase(subDataBaseName);
    if (!subDataBase) return false;

    if (!subDataBase) {
        logger.logInfo("no Item found");
        return false;
    } else {
        logger.logInfo("Items found: "+subDataBase);
        return subDataBase;
    }
}



/**
 * adds an item to the sub-database
 * @param {string} subDataBaseName name of the sub-database 
 * @param {object} item the item that should be added to the sub-database
 * 
 * @returns {bool} whether something went wrong
 */
function addItem(subDataBaseName, item) {
    //read database
    
    subDataBase = readDatabase(subDataBaseName);
    if (!subDataBase) return false;

    //manipulate data
    logger.logInfo("adding item to subdatabase: "+subDataBaseName);
    item.date = new Date();
    if (subDataBase.length>0)
    {
        item.index = parseInt(subDataBase[subDataBase.length - 1].index) + 1;
    } else {
        item.index = 0;
    }

    subDataBase.push(item);

    //write database
    if (writeDatabase(subDataBaseName, subDataBase)) {
        return true;
    } else {
        return false;
    }
}



/**
 * edits an item in the sub-database
 * @param {string} subDataBaseName name of the sub-database 
 * @param {string} param which parameter of the database should be compared with the query
 * @param {int} query value to compare to the param of the database
 * @param {object} item newItem that should be merged with the old
 * 
 * @returns {bool} whether something went wrong
 */
function editItem(subDataBaseName, param, query, newItem) {
    //read database
    subDataBase = readDatabase(subDataBaseName);
    if (!subDataBase) return false;

    //manipulate data
    
    var oldItem = subDataBase.filter(item => String(item[param]).toLowerCase().includes(String(query).toLowerCase()))[0];
    logger.logInfo("editing item from subdatabase: "+subDataBaseName+", oldItem: "+oldItem+", newItem: "+newItem);
    newItem=Object.assign(oldItem,newItem);

    deleteItem(subDataBaseName,oldItem.index);
    addItem(subDataBaseName,newItem);

}



/**
 * deletes an item from the sub-database
 * @param {string} subDataBaseName name of the sub-database 
 * @param {int} index index of the item that should be deleted
 * 
 * @returns {bool} whether something went wrong
 */
function deleteItem(subDataBaseName, index) {
    //read database
    subDataBase = readDatabase(subDataBaseName);
    if (!subDataBase) return false;

    //manipulate data
    logger.logInfo("deleting item from subdatabase: "+subDataBaseName+", index: "+index);
    subDataBase = subDataBase.filter(item => item.index != index);

    //write database
    if (writeDatabase(subDataBaseName, subDataBase)) {
        return true;
    } else {
        return false;
    }
}





// Export public functions
//
module.exports = {
    searchItems,
    getItem,
    getAllItems,
    addItem,
    deleteItem,
    editItem
}



//
// PRIVATE FUNCTIONS
//
//
//


/**
 * reads a sub-database from a file
 * @param {string} subDataBaseName name of the sub-database 
 * 
 * @returns {object} the sub-database
 */
function readDatabase(subDataBaseName) {
    var database = {};

    logger.logInfo("opening database-file: "+config.databasename);
    fs.openSync(config.databasename, 'a');
    logger.logInfo("reading database-file: "+config.databasename);
    var rawdata = fs.readFileSync(config.databasename);

    if (rawdata.length <= 0) {
        logger.logInfo("database-file is empty");
    } else {

        try {
            database = JSON.parse(rawdata);
        } catch (e) {
            logger.logError("database-file is corrupted\n" + e);
            throw "database-file is corrupted\n" + e;
        }

    }

    if (!database[subDataBaseName]) {
        logger.logWarning("sub-database does not exist. creating sub-database: "+subDataBaseName);
        database[subDataBaseName]=[];
    }

    logger.logInfo("returning sub-database: "+database[subDataBaseName]);
    return database[subDataBaseName];
}


/**
 * writes a sub-database to a file
 * @param {string} subDataBaseName name of the sub-database 
 * @param {object} subDataBase the sub-database which should be written to a file
 * 
 * @returns {bool} whether something went wrong
 */
function writeDatabase(subDataBaseName, subDataBase) {
    var database = {};
    logger.logInfo("opening database-file "+config.databasename);
    fs.openSync(config.databasename, 'a');
    logger.logInfo("reading database-file: "+config.databasename);
    var rawdata = fs.readFileSync(config.databasename);

    if (rawdata.length <= 0) {
        logger.logInfo("database-file is empty: "+rawdata);
    } else {
        logger.logInfo("parsing existing database-file-data: "+rawdata);
        try {
            database = JSON.parse(rawdata);
        } catch (e) {
            logger.logError("database-file is corrupted\n" + e);
            throw "database-file is corrupted\n" + e;
        }
    }

    database[subDataBaseName] = subDataBase;

    rawdata = JSON.stringify(database);

    logger.logInfo("writing database-file: "+config.databasename);
    fs.writeFileSync(config.databasename, rawdata);
    return true;
}