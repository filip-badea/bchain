'use strict';

var _mongodb = require('mongodb');

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Imports
var usersInfo = require('./usersInfo.json');
var http_port = process.env.HTTP_PORT || 3005;

/**
 * Add all userInfo to the MongoDB
 */
var initDatabase = function initDatabase() {

    _mongodb.MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, database) {
        if (err) {
            return console.dir(err);
        }
        var myAwesomeDB = database.db('exampleDb');
        var collection = myAwesomeDB.collection('test');
        collection.insertMany(usersInfo, { w: 1 }, function (err, result) {});

        collection.findOne({ cnp: "1931122345612" }, function (err, item) {
            console.log(item);
        });
        database.close();
    });
};

/**
 * The server that will listen to mobile requests
 */
var initAndroidListenerServer = function initAndroidListenerServer() {

    var app = (0, _express2.default)();
    app.use(_bodyParser2.default.json());

    app.post('/sendVote', function (req, res) {
        var person = req.body.data;
        if (person !== null) {
            queryForPersonAndSendToMiner(person, sendToMiner, function (message) {
                console.log("Response to android", message);
                res.send(message);
            });
        } else {
            res.send("No information sent");
        }
    });
    app.listen(http_port, function () {
        return console.log('Listening http on port: ' + http_port);
    });
};

var showAllBlocks = function showAllBlocks() {
    _axios2.default.get('http://127.0.0.1:3001/blocks', {}).then(function (response) {
        console.log(response.data);
    }).catch(function (error) {
        console.log(error);
    });
};

var sendToMiner = function sendToMiner(vote, responseToAndroid) {
    _axios2.default.post('http://127.0.0.1:3001/mineBlock', { data: vote }).then(responseToAndroid).catch(function (error) {
        console.log(error);
    });
};

/**
 * Connect to the Mongo database and query For credentials
 */
var queryForPersonAndSendToMiner = function queryForPersonAndSendToMiner(person, sendToMiner, responseToAndroid) {
    console.log("Item to be searched", person);
    _mongodb.MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, database) {
        if (err) {
            return console.dir(err);
        }
        var myAwesomeDB = database.db('exampleDb');
        var collection = myAwesomeDB.collection('test');

        collection.findOne({ cnp: person.cnp }, function (err, infoReturned) {
            console.log("Item searched", infoReturned !== null);
            if (infoReturned !== null) {
                if (checkPersonValidity(person, infoReturned)) {
                    if (infoReturned.voted !== true) {
                        sendToMiner({
                            region: person.region,
                            voteType: person.voteType,
                            voteChoice: person.voteChoice,
                            timestamp: person.timestamp
                        }, responseToAndroid("Voted Succesfully"));
                    } else {
                        responseToAndroid("Already voted");
                    }
                } else {
                    responseToAndroid("Incorrect information - info not valid");
                }
            } else {
                responseToAndroid("Can't found person");
            }
        });

        collection.remove();
        database.close();
    });
};

var checkPersonValidity = function checkPersonValidity(person, infoReturned) {
    return person.firstName === infoReturned.firstName && person.cnp === infoReturned.cnp && person.fullAddress === infoReturned.fullAddress && person.lastName === infoReturned.lastName && person.region === infoReturned.region && person.sex === infoReturned.sex && person.dateOfBirth === infoReturned.dateOfBirth && person.dateOfExpiry === infoReturned.dateOfExpiry;
};

initDatabase();
initAndroidListenerServer();

// showAllBlocks(receivedBlocks);
//console.log("Found person", queryForPersonAndSendToMiner({mykey:1}));