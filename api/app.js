var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var dotenv = require('dotenv');

var {Validator, ValidationError} = require('express-json-validator-middleware');

const deviceRouter = require('./routes/device');
const frontEndRouter = require('./routes/access/access');
const documentationRouter = require('./swagger-jsdoc');
	
// Load environment variables from .env
dotenv.config();

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'pug');
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

const router = express.Router();

router.use('/device', deviceRouter);
router.use('/access', frontEndRouter);
router.use('/docs', documentationRouter);

app.use('/api', router);
app.use('/docs', express.static(path.join(__dirname, '..', 'docs')));
app.use(express.static(path.join(__dirname, '..', 'build')));


//Error handling for API request validation failures

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	res.sendStatus(404);
});

// error handler
app.use(function (err, req, res, next) {

	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	if (err.name === 'UnauthorizedError') {
		res.status(401).send('Unauthorized');
	}
	else if (err instanceof ValidationError) {
		// At this point you can execute your error handling code
		console.log(err);
		res.status(400).send('Invalid Request');
		next();
	}
	else {
		// render the error page
		console.log(err);
		res.sendStatus(err.status || 500);
	}
});


module.exports = app;
