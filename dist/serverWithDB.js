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

// Add all userInfo to the MongoDB
var initDatabase = function initDatabase() {
    _mongodb.MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, database) {
        if (err) {
            return console.dir(err);
        }
        var myAwesomeDB = database.db('exampleDb');
        var collection = myAwesomeDB.collection('test');
        collection.insertMany(usersInfo, { w: 1 }, function (err, result) {});
        // collection.find().toArray(function (err, items) {
        //     console.log("Items part 1: ", items);
        // });
        collection.findOne({ firstName: "Mihai" }, function (err, item) {
            console.log(item);
        });
        database.close();
    });
};

// The server that will listen to mobile requests
var initAndroidListenerServer = function initAndroidListenerServer() {
    var app = (0, _express2.default)();
    app.use(_bodyParser2.default.json());

    app.post('/sendVote', function (req, res) {
        var person = req.body.data;
        queryForPersonAndSendToMiner(person, sendToMiner, function (message) {
            res.send(message);
        });
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

var sendToMiner = function sendToMiner(vote, callback) {
    _axios2.default.post('http://127.0.0.1:3001/mineBlock', vote).then(callback).catch(function (error) {
        console.log(error);
    });
};

// Connect to the db and query For credentials
var queryForPersonAndSendToMiner = function queryForPersonAndSendToMiner(person, sendToMiner, responseToAndroid) {
    console.log("Item searched", person);
    var promise = _mongodb.MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, database) {
        if (err) {
            return console.dir(err);
        }
        var myAwesomeDB = database.db('exampleDb');
        var collection = myAwesomeDB.collection('test');

        collection.findOne(person, function (err, itemReturned) {
            console.log("Item searched", itemReturned !== null);
            if (itemReturned !== null) {
                if (itemReturned.voted !== true) {
                    sendToMiner(itemReturned, responseToAndroid("Voted Succesfully"));
                } else {
                    responseToAndroid("Already voted");
                }
            }
        });

        collection.remove();
        database.close();
    });
};

initDatabase();
// initAndroidListenerServer();

// showAllBlocks(receivedBlocks);
//console.log("Found person", queryForPersonAndSendToMiner({mykey:1}));