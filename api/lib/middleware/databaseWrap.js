/**
 * Created by eliwinkelman on 10/8/19.
 */
async function databaseWrap (res, next, fn, ...args) {
		let result;
		try {
			result = await fn(args);
		}
		catch (err) {
			// error handler
			console.log(err);
			res.sendStatus(401);
			next()
		}
		return result;
}

module.exports = databaseWrap;