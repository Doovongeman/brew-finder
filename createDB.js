// File to create database
// Notes for new MongoDB users
// 	collection = table
//	document = tuple
//	column = field

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/blessed";

// Create database if not present
MongoClient.connect(url, function(err, db) {
  	if (err) throw err;
  	console.log("Database created!");
  	db.close();
});

// Add users collection, star collection, messages collection and dummy data
MongoClient.connect(url, function(err, db) {
  	if (err) throw err;
  	db.createCollection("users", function(err, res) {
		if (err) throw err;
		console.log("Users collection created!");
		var myobj = { username: "d", password: "test" };
		db.collection("users").insertOne(myobj, function(err, res) {
			if (err) throw err;
			console.log("1 user inserted");
			db.close();
		});
  	});
});
MongoClient.connect(url, function(err, db) {
  	if (err) throw err;
  	db.createCollection("ratings", function(err, res) {
		if (err) throw err;
		console.log("ratings collection created!");
		myobj = { usedID: 0, beerID: 1, starCount: 4 };
		db.collection("ratings").insertOne(myobj, function(err, res) {
			if (err) throw err;
			console.log("1 rating inserted");
			db.close();
		});
  	});
});
MongoClient.connect(url, function(err, db) {
  	if (err) throw err;
  	db.createCollection("messages", function(err, res) {
		if (err) throw err;
		console.log("messages collection created!");

		myobj = {message: "It's a beer!"};
		db.collection("messages").insertOne(myobj, function(err, res) {
			if (err) throw err;
			console.log("1 message inserted");
			db.close();
		});
	});
});
