var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var dotenv = require('dotenv');

var { Validator, ValidationError } = require('express-json-validator-middleware');

const deviceRouter = require('./routes/device');
const frontEndRouter = require('./routes/access/access');
const documentationRouter = require('./swagger-jsdoc');

// Load environment variables from .env
dotenv.config();

var app = express();

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('invalid token...');
    }
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.use('/device', deviceRouter);
app.use('/access', frontEndRouter);
app.use('/docs', documentationRouter);

//Error handling for API request validation failures

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err instanceof ValidationError) {

    // At this point you can execute your error handling code

    res.status(400).send('invalid');
    next();
  }
  else {
    // render the error page
    res.status(err.status || 500);
    console.log(err);
    res.render('error', {error: err});
  }

});




module.exports = app;
