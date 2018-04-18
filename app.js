let express = require("express");
let bodyParser = require("body-parser");
let app = express();
let mongoose = require('mongoose');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/blessed');
let db = mongoose.connection;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));


//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	// connected to db
});

//use sessions for tracking logins
app.use(session({
	secret: 'nonya',
	resave: true,
	saveUninitialized: false,
	store: new MongoStore({
		mongooseConnection: db
	})
}));


// serve static files from public
app.use(express.static(__dirname + '/public'));

let routes = require('./routes/router');
app.use('/',routes);


// catch 404 and send to error handler
app.use(function (req, res, next) {
	var err = new Error('File Not Found');
	err.status = 404;
	next(err);
});

// error handler and logger
app.use(function (err, req, res, next) {
	console.log("LOG:", req.method, req.url, req.body);
	res.status(err.status || 500);
	res.send(err.message);
});

app.listen(3000, function () {
	console.log("Express app listening on port 3000");
});