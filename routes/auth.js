var express = require('express');
var router = express.Router();
var passport = require('passport');
var dotenv = require('dotenv');
var util = require('util');
var url = require('url');
var querystring = require('querystring');
//MongoDB
var mongoClient = require('../javascript/db.js');
const MUUID = require('uuid-mongodb');


dotenv.config();

// Perform the login, after login Auth0 will redirect to callback
router.get('/login', passport.authenticate('auth0', {
	scope: 'openid email profile'
}), function (req, res) {
	res.redirect('/');
});

// Perform the final stage of authentication and redirect to previously requested URL or '/user'
router.get('/callback', function (req, res, next) {
	passport.authenticate('auth0', function (err, user, info) {
		if (err) { return next(err); }
		if (!user) { return res.redirect('/login'); }
		req.logIn(user, function (err) {
			if (err) { return next(err); }

			//grab user object from our database and attach it to req.user
			// try to get the user details from the User model and attach it to the request object
			mongoClient( (err, client) => {
				if (err) {
					return next(err);
				}
				else {
					const db = client.db("Loom");
					const Users = db.collection("Users");
					Users.findOne({"auth0_id": user.id}, function (err, userMeta) {
						if (err) {
							return next(err);
						} else if (userMeta != null) {
						
							req.user.meta = userMeta;

							const returnTo = req.session.returnTo;
							delete req.session.returnTo;
							res.redirect(returnTo || '/u/');
						} else {
							//we don't have this user in our system yet
							//create a new user that doesn't own any devices

							Users.insertOne({
								auth0_id: user.id,
								devices: [],
								role: "user",
								email: user.email
							}, function(err, response) {
								if (err) {
									return next(err);
								}
								else {
									req.user.meta = response.ops[0];
									const returnTo = req.session.returnTo;
									delete req.session.returnTo;
									res.redirect(returnTo || '/u/');
								}
							});


						}
					})
				}
			});
		});
	})(req, res, next);
});

// Perform session logout and redirect to homepage
router.get('/logout', (req, res) => {
	req.logout();

	var returnTo = req.protocol + '://' + req.hostname;
	var port = req.connection.localPort;
	if (port !== undefined && port !== 80 && port !== 443) {
		returnTo += ':' + port;
	}
	var logoutURL = new URL(
		util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN)
	);
	var searchString = querystring.stringify({
		client_id: process.env.AUTH0_CLIENT_ID,
		returnTo: returnTo
	});
	logoutURL.search = searchString;

	res.redirect(logoutURL);
});

module.exports = router;