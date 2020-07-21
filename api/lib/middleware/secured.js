//setup authentication
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
var dotenv = require('dotenv');

dotenv.config();

console.log(process.env.AUTH0_DOMAIN);

const checkJwt = jwt({
	secret: jwksRsa.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 5,
		jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
	}),
	audience: 'localhost:4000',
	issuer: `https://${process.env.AUTH0_DOMAIN}/`,
	algorithms: ["RS256"]
});

module.exports = checkJwt;
