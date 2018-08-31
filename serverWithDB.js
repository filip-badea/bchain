// Imports
import {MongoClient} from 'mongodb';
import axios from 'axios';
import express from "express";
import bodyParser from "body-parser";

var usersInfo = require('./usersInfo.json');
var http_port = process.env.HTTP_PORT || 3005;




// Add all userInfo to the MongoDB
const initDatabase = () => {
    MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, database) {
        if (err) {
            return console.dir(err);
        }
        const myAwesomeDB = database.db('exampleDb')
        var collection = myAwesomeDB.collection('test');
        collection.insertMany(usersInfo, {w: 1}, function (err, result) {


        });
        // collection.find().toArray(function (err, items) {
        //     console.log("Items part 1: ", items);
        // });
        collection.findOne({firstName: "Mihai"}, function (err, item) {
            console.log(item);
        });
        database.close();

    });
}





// The server that will listen to mobile requests
const initAndroidListenerServer = () => {
    const app = express();
    app.use(bodyParser.json());

    app.post('/sendVote', (req, res) => {
        const person = req.body.data;
        queryForPersonAndSendToMiner(person, sendToMiner, (message) => {res.send(message);});

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

const sendToMiner = (vote, callback) => {
    axios.post(
        'http://127.0.0.1:3001/mineBlock',
        vote
        )
        .then(callback)
        .catch(function (error) {
            console.log(error);
        });
};


// Connect to the db and query For credentials
const queryForPersonAndSendToMiner = (person, sendToMiner, responseToAndroid) => {
  console.log("Item searched", person);
      var promise = MongoClient.connect("mongodb://localhost:27017/exampleDb", function (err, database) {
          if (err) {
              return console.dir(err);
          }
          const myAwesomeDB = database.db('exampleDb');
          let collection = myAwesomeDB.collection('test');


          collection.findOne(person, function (err, itemReturned) {
              console.log("Item searched", itemReturned !== null);
              if (itemReturned !== null) {
                  if (itemReturned.voted !== true) {
                      sendToMiner(itemReturned, responseToAndroid("Voted Succesfully"));
                  }
                  else {
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
