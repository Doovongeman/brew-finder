let express = require('express');
let router = express.Router();
let User = require("../models/users");
let Rating = require("../models/ratings");
let Message = require("../models/messages");


// GET route for webpage
router.get('/', function (req, res, next) {
	return res.sendFile(path.join(__dirname + '/public/index.html'));
});

// New user
router.post('/users', function(req, res, next) {
	if (req.body.password !== req.body.passwordConf){
		let err = new Error('Passwords do not match');
		err.status = 400;
		res.send("passwords don't match");
		return next(err);
	}

	if (req.body.username &&
		req.body.password &&
		req.body.passwordConf){
			console.log('registering')
			var userData = {
				username: req.body.username,
				password: req.body.password,
			}	
			User.create(userData, function(err, user) {
				if (err){
					return next(err);
				} else {
					req.session.userId = user._id;
					return res.redirect('/');
				}});
		}
	else if (req.body.usernameLog && req.body.passwordLog) {
		console.log("logging in")
		User.authenticate(req.body.usernameLog, req.body.passwordLog, function (error, user) {
			if (error || !user) {
				var err = new Error('Wrong email or password.');
				err.status = 401;
				return next(err);
			} else {
				req.session.userId = user._id;
				return res.redirect('/');
			}
		});
		} else {
			var err = new Error('All fields required.');
			err.status = 400;
			return next(err);
		}
});


// Get user for session
router.get('/users', function (req, res, next) {
	User.findById(req.session.userId)
	.exec(function (error, user) {
		if (error) {
			return next(error);
		} else {
			if (user === null) {
				let err = new Error('Not authorized! Go back!');
					err.status = 400;
					return next(err);
			} else {
				return res.json(user.username);
			}
		}
	});
});

// New rating
router.post('/ratings', function(req, res, next) {
	if (req.body.username && req.body.beerid && req.body.rating){
		console.log('adding rating')
		var ratingData = {
			username: req.body.username,
			beerid: req.body.beerid,
			rating: req.body.rating
		}	
		Rating.create(ratingData, function(err, user) {
			if (err){
				return next(err);
			} else {
				req.session.userId = user._id;
				return res.redirect('/');
			}});
	} 
	else {
		var err = new Error('All fields required.');
		err.status = 400;
		return next(err);
	}
});

// Edit rating
router.put('/ratings', function(req, res, next) {
	if (req.body.username && req.body.beerid && req.body.rating){
		console.log('changing rating')
		var conditions = {
			username: req.body.username,
			beerid: req.body.beerid
		}	
		var update = {
			rating: req.body.rating
		}
		Rating.update(conditions, update, function(err, user) {
			if (err){
				return next(err);
			}});
	} 
	else {
		var err = new Error('All fields required.');
		err.status = 400;
		return next(err);
	}
});

// Delete rating
router.delete('/ratings', function(req, res, next) {
	if (req.body.username && req.body.beerid){
		console.log('deleting rating')
		var conditions = {
			"username": req.body.username,
			"beerid": req.body.beerid
		}	
		Rating.remove(conditions, function(err, user) {
			if (err){
				return next(err);
			}});
	} 
	else {
		var err = new Error('Error deleting the rating');
		err.status = 400;
		return next(err);
	}
});

// Get ratings for search results
router.get('/ratings', function (req, res, next) {
	Rating.find({"beerid":req.query.beerid})
	.exec(function (error, rating) {
		if (error) {
			return next(error);
		} else {
			if (rating === null) {
				let err = new Error("User is still null");
					err.status = 400;
					return next(err);
			} else {
				return res.json(rating);
			}
		}
	});
});

// Get user's ratings
router.get('/my_ratings', function (req, res, next) {
	Rating.find({"username":req.query.username})
	.exec(function (error, rating) {
		if (error) {
			return next(error);
		} else {
			if (rating === null) {
				let err = new Error("User is still null");
					err.status = 400;
					return next(err);
			} else {
				return res.json(rating);
			}
		}
	});
});

// /logout
router.post('/logout', function(req, res, next) {
	if (req.session) {
	// delete session object
		req.session.destroy(function(err) {
			if(err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});

// find lowest unused id number
let getUnusedId = function(id, callback){
	Message.find({"id": id}).exec(function(error, message){
		if (error){
			return next(err);
		} else {
			if (message.length==0){
				callback(id);
			} else {
				getUnusedId(id+1, callback);
			}
		}
	});
}

// POST message
router.post('/api/messages', function(req,res,next){
	getUnusedId(1, function(unusedID){
		let message = { id: unusedID,
			data: req.body.data
		}
		Message.create(message, function(err) {
			if (err){
				return next(err);
			} else {
				return res.redirect('/');
		}});
	});
});

// GET message
router.get('/api/messages/:id', function(req,res,next){
	Message.find({"id": req.params.id}).exec(function(error, message){
		console.log("will this change propogate???");
		if (error){
			return next(err);
		} else {
			return res.json({id: message[0].id,
					data: message[0].data,
					timestamp: message[0].timestamp
			});
		}
	});
});

// GET all message
router.get('/api/messages', function(req,res,next){
	Message.find({},{_id:0, id:1, data:1, timestamp:1})
	.exec(function(error, messages) {
		console.log("messages are like this yo.\n");
		console.log(messages);
		if (error){
			return next(err);
		} else {
			console.log("messages\n" + messages[1]);
			return res.json(messages);
		}
	});
});

// GET latest message
router.get('/api/messageslatest', function(req,res,next){
	Message.find({},{_id:0, id:1, data:1, timestamp:1})
	.exec(function(error, messages) {
		console.log("messages are like this yo.\n");
		console.log(messages);
		if (error){
			return next(err);
		} else {
			console.log("messages\n" + messages[1]);
			return res.json(messages[messages.length -1]);
		}
	});
});

// GET random number
router.get('/random', function(req,res,next){
	console.log("I'm getting requested!");
	// return res.json({"data = {number: " + Math.floor(Math.random()*20) + "}"});
	var text = '{"number": ' + Math.floor(Math.random()*20) + '}\n';
	var obj = JSON.parse(text);
	// res.writeHead(200, { 'Content-Type': 'application/json' });
	return res.json({"number": + Math.floor(Math.random()*20)})
	// return res.json(obj);
});


// DELETE message
router.delete('/api/messages/:id', function(req,res,next){
	Message.remove({id: req.params.id}, function(err, message){
		if (err){
			return next(err);
		} else {
			return res.redirect('/');
		}
	});
});

module.exports = router;
