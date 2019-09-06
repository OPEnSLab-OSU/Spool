/**
 * Created by eliwinkelman on 7/17/19.
 */
// userInViews.js

module.exports = function () {
	return function (req, res, next) {
		res.locals.user = req.user;
		next();
	};
};