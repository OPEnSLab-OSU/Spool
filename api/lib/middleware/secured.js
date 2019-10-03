//setup authentication
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
var dotenv = require('dotenv');

dotenv.config();
// using JWKS from YOUR_DOMAIN
const client = jwksRsa({
	strictSsl: true, // Default value
	jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
	requestHeaders: {}, // Optional
	requestAgentOptions: {}
});

const checkJwt = jwt({
	secret: client.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 5
	}),

	audience: 'localhost:4000',
	issuer: `https://${process.env.AUTH0_DOMAIN}/`,
	algorithm: ["RS256"]
});

module.exports = checkJwt;