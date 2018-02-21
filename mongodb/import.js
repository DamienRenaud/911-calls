var mongodb = require('mongodb');
var csv = require('csv-parser');
var fs = require('fs');

var MongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://localhost:27017/911-calls';

var insertCalls = function(db, callback) {
    var collection = db.collection('calls');
    collection.createIndex({"location" : "2dsphere"});

    var calls = [];
    fs.createReadStream('../911.csv')
        .pipe(csv())
        .on('data', data => {
            var call = {
                "location": [parseFloat(data.lng), parseFloat(data.lat)],
                "desc": data.desc,
                "zip": data.zip,
                "title": data.title.substr(data.title.indexOf(':') + 1, data.title.length - 1).trim(),
                'category': data.title.substr(0, data.title.indexOf(':')).trim(),
                "timeStamp": data.timeStamp,
                "twp": data.twp,
                "addr": data.addr,
                "e": data.e,
            };
            calls.push(call);
        })
        .on('end', () => {
          collection.insertMany(calls, (err, result) => {
            callback(result)
          });
        });
}

MongoClient.connect(mongoUrl, (err, db) => {  
    insertCalls(db, result => {
        console.log(`${result.insertedCount} calls inserted`);
        db.close();
    });
});
