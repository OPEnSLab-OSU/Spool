/**
 * Created by eliwinkelman on 7/29/19.
 */

// This function should be used to wrap async routes to make sure that errors are handled correctly
module.exports = (fn) => {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};