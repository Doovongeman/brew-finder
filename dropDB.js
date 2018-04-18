// File to reset database

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/blessed";

// delete database
MongoClient.connect(url, function(err, db) {
  	if (err) throw err;
	db.dropDatabase(function(err, success){
		if (err) throw err;
		if (success){
			console.log("database dropped");
		}
		else {
			console.log("failed to delete database");
		}
		
  		db.close();
	});
});
