var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv');
var session = require('express-session');
var passport = require('passport');
var userInViews = require('./lib/middleware/userInViews');

var { Validator, ValidationError } = require('express-json-validator-middleware');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var deviceRouter = require('./routes/device');
var frontEndRouter = require('./routes/access');



// Load environment variables from .env
dotenv.config();

var app = express();

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('invalid token...');
    }
});

app.use(cookieParser());

// config express-session
var sess = {
  secret: "XPSdc33/RH+NGIID/jDvCA==",
  cookie: {},
  resave: false,
  saveUninitialized: true
};

if (app.get('env') === 'production') {
  sess.cookie.secure = true; // serve secure cookies, requires https
}

app.use(session(sess));

// Load Passport
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use(userInViews());

app.use('/home/', indexRouter);
app.use('/users', usersRouter);
app.use('/device', deviceRouter);
app.use('/access', frontEndRouter);

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
