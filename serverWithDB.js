// Imports
import {MongoClient} from 'mongodb';
import axios from 'axios';
import express from "express";
import bodyParser from "body-parser";

var usersInfo = require('./usersInfo.json');
var http_port = process.env.HTTP_PORT || 3005;



/**
 * Add all userInfo to the MongoDB
 */
const initDatabase = () => {

    MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, database) {
        if (err) {
            return console.dir(err);
        }
        const myAwesomeDB = database.db('exampleDb');
        var collection = myAwesomeDB.collection('test');
        collection.insertMany(usersInfo, {w: 1}, function (err, result) {


        });

        collection.findOne({cnp: "1931122345612"}, function (err, item) {
            console.log(item);
        });
        database.close();

    });
};




/**
 * The server that will listen to mobile requests
 * Example of valid post request:
 *  curl -H "Content-type:application/json"
 *  --data '{"data": {
 *  "firstName": "Mihai",
 *  "lastName": "Dumitru",
 * "cnp": "1931122345612",
 * "fullAddress": "",
 * "region": "Valcea",
 * "sex": "M",
 * "dateOfBirth": "",
 * "dateOfExpiry": "",
 * "voteType":"prezidential",
 * "voteChoice": "Presedinte1",
 * "timeStamp": "31-08-2018" }}' http://localhost:3005/sendVote
 */
const initAndroidListenerServer = () => {

    const app = express();
    app.use(bodyParser.json());

    app.post('/sendVote', (req, res) => {
        const person = req.body.data;
        if (person !== null) {
            queryForPersonAndSendToMiner(person, sendToMiner, (message) => {
                console.log("Response to android", message);
                res.send(message);
            });
        } else {
            res.send("No information sent")
        }


    });
    app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
};


const showAllBlocks = () => {
    axios.get('http://127.0.0.1:3001/blocks', {
    })
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
};

const sendToMiner = (vote, responseToAndroid) => {
    axios.post(
        'http://127.0.0.1:3001/mineBlock',
        {data: vote}
        )
        .then(responseToAndroid)
        .catch(function (error) {
            console.log(error);
        });
};


/**
 * Connect to the Mongo database and query For credentials
 */
const queryForPersonAndSendToMiner = (person, sendToMiner, responseToAndroid) => {
  console.log("Item to be searched", person);
      MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, database) {
          if (err) {
              return console.dir(err);
          }
          const myAwesomeDB = database.db('exampleDb');
          let collection = myAwesomeDB.collection('test');


          collection.findOne({cnp: person.cnp}, function (err, infoReturned) {
              console.log("Item searched", infoReturned !== null);
              if (infoReturned !== null) {
                  if (checkPersonValidity(person, infoReturned)) {
                      if (infoReturned.voted !== true) {
                          sendToMiner(
                              {
                                  region: person.region,
                                  voteType: person.voteType,
                                  voteChoice: person.voteChoice,
                                  timestamp: person.timestamp
                              },
                              responseToAndroid("Voted Succesfully"));

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

          database.close();

      });
  };

const checkPersonValidity = (person, infoReturned) => {
    return person.firstName === infoReturned.firstName &&
        person.cnp === infoReturned.cnp &&
        person.fullAddress === infoReturned.fullAddress &&
        person.lastName === infoReturned.lastName &&
        person.region === infoReturned.region &&
        person.sex === infoReturned.sex &&
        person.dateOfBirth === infoReturned.dateOfBirth &&
        person.dateOfExpiry === infoReturned.dateOfExpiry

};


initDatabase();
initAndroidListenerServer();

// showAllBlocks(receivedBlocks);
//console.log("Found person", queryForPersonAndSendToMiner({mykey:1}));
