//setup authentication
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
var dotenv = require('dotenv');

dotenv.config();

const checkJwt = jwt({
	secret: jwksRsa.expressJwtSecret({
		strictSsl: false,
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 5,
		jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
		requestAgentOptions: {
			rejectUnauthorized: false
		}
	}),
	audience: 'localhost:4000',
	issuer: `https://${process.env.AUTH0_DOMAIN}/`,
	algorithm: ["RS256"]
});

module.exports = checkJwt;