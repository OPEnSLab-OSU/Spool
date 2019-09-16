/**
 * Created by eliwinkelman on 9/13/19.
 */
const wrapAsync = require('./asyncWrap');
var mongoClient = require('../../javascript/db');

module.exports = function() {
	return wrapAsync(async (req, res, next) => {

		let auth0_id = req.user.sub;
		let client = await mongoClient().catch((err) => {
			throw err;
		});

		const db = client.db("Loom");
		const Users = db.collection("Users");

		var user = await Users.findOne({"auth0_id": auth0_id}).catch((err) => {
			throw err;
		});

		if (user != null) {
			req.apiUser = user;
			console.log('got user!');
			next();
		} else {
			//we don't have this user in our system yet
			//create a new user that doesn't own any devices

			let newUser = await Users.insertOne({
				auth0_id: id,
				devices: [],
				role: "user"
			}).catch((err) => {
				throw err;
			});
			req.apiUser = newUser;
			next();
		}
	})
};

