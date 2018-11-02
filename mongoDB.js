const {MongoClient, ObjectId} = require('mongodb');
var url = "mongodb://localhost:27017/quickemail";

var obj = new ObjectId()

MongoClient.connect(url, (err, db) => {
  if (err) throw err;
  console.log("Connected to MongoDB Server");
  db.close();
});
