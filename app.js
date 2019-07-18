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
var authRouter = require('./routes/auth');




//setup authentication

// Load environment variables from .env
dotenv.config();

var Auth0Strategy = require('passport-auth0');

// Configure Passport to use Auth0
var strategy = new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL:
      process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/auth/callback'
    },
    function (accessToken, refreshToken, extraParams, profile, done) {
      // accessToken is the token to call Auth0 API (not needed in the most cases)
      // extraParams.id_token has the JSON Web Token
      // profile has all the information from the user
      return done(null, profile);
    }
);

passport.use(strategy);

// You can use this section to keep a smaller payload
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

var app = express();

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

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/device', deviceRouter);
app.use('/u', frontEndRouter);
app.use('/auth', authRouter);
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
