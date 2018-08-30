
import {MongoClient} from 'mongodb';

// Add all userInfo to the MongoDB
MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, database) {
  if(err) { return console.dir(err); }

  const myAwesomeDB = database.db('exampleDb')

  var collection = myAwesomeDB.collection('test');
  var docs = [{mykey:1}, {mykey:2}, {mykey:3}];

  collection.insertMany(docs, {w:1}, function(err, result) {


  });
  collection.find().toArray(function(err, items) {console.log("Items part 1: ",items);});
  collection.findOne({mykey:1}, function(err, item) {console.log(item);});
  database.close();

});


var found = false;

const changeValue = () => {
  found = true;
}


// Connect to the db
const queryForPerson = (person) => {
  console.log("Item searched", person);
  MongoClient.connect("mongodb://localhost:27017/exampleDb", function(err, database) {
    if(err) { return console.dir(err); }

    //console.log(database);
    const myAwesomeDB = database.db('exampleDb')
    var collection = myAwesomeDB.collection('test');


      collection.findOne(person, function(err, item) {
        console.log("Item searched", item !== null);
        if(item !== null) {
          changeValue();
        }
      });

      collection.remove();
      database.close();
    });

    return found;
}


console.log("Found person",queryForPerson({mykey:1}));
