/**
 * Created by eliwinkelman on 12/1/19.
 */

/**
 * Module dependencies.
 */

var app = require('../device_app');
var debug = require('debug')('mongoserver:server');
var https = require('https');
var getKeys = require("../lib/manageKeys");
var crypto = require('crypto');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3002');
app.set('port', port);

/**
 * Create HTTP server.
 */
///////NOTE: use promises here ///////
key = getKeys().then(keys => {
	//get or create keys
	startServer(keys);
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}


function startServer(keys) {
//key is serviceKey
	//cert is certificate

	var server = https.createServer({
		key: keys.key,
		cert: keys.certificate,
		ca: keys.ca.certificate,
		requestCert: true,
		rejectUnauthorized: true,
		ecdhCurve: 'P-256'
	}, app);

	/**
	 * Listen on provided port, on all network interfaces.
	 */

	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);

	console.log("Server listening on https://localhost:3002/");
	/**
	 * Event listener for HTTP server "error" event.
	 */

	function onError(error) {
		if (error.syscall !== 'listen') {
			throw error;
		}

		var bind = typeof port === 'string'
			? 'Pipe ' + port
			: 'Port ' + port;

		// handle specific listen errors with friendly messages
		switch (error.code) {
			case 'EACCES':
				console.error(bind + ' requires elevated privileges');
				process.exit(1);
				break;
			case 'EADDRINUSE':
				console.error(bind + ' is already in use');
				process.exit(1);
				break;
			default:
				throw error;
		}
	}

	/**
	 * Event listener for HTTP server "listening" event.
	 */

	function onListening() {
		var addr = server.address();
		var bind = typeof addr === 'string'
			? 'pipe ' + addr
			: 'port ' + addr.port;
		debug('Listening on ' + bind);
	}
}
