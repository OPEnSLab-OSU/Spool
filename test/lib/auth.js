/**
 * Created by eliwinkelman on 8/20/20.
 */

const Authenticator = require('auth0').AuthenticationClient;
const dotenv = require('dotenv');
const fs = require('fs');
const request = require('superagent');
const jwt = require('jsonwebtoken');

const readOptions = {
	encoding: "utf8"
};

dotenv.config();

const clientIdPath = "/run/secrets/frontEndClientId.txt";
const clientId = fs.readFileSync(clientIdPath, readOptions);
const clientSecretPath = "/run/secrets/frontEndClientSecret.txt";
const clientSecret = fs.readFileSync(clientSecretPath, readOptions);
const testUserPasswordPath = "/run/secrets/testUserPassword.txt";
const testUserPassword = fs.readFileSync(testUserPasswordPath, readOptions);

const testUserPasswordPath2 = "/run/secrets/testUserPassword2.txt";
const testUserPassword2 = fs.readFileSync(testUserPasswordPath2, readOptions);


async function getAccessToken(accessToken, firstUser=true) {

    if (accessToken == null || Date.now() >= (jwt.decode(accessToken).exp - 10) * 1000) {
        const response = await request.post('https://' + process.env.AUTH0_DOMAIN + '/oauth/token')
        .type('form')
        .send({ grant_type: 'password',
                 username: firstUser ? process.env.AUTH0_TEST_USERNAME : process.env.AUTH0_TEST_USERNAME_2,
                 password: firstUser ? testUserPassword : testUserPassword2,
                 audience: process.env.AUTH0_AUDIENCE,
                 client_id: clientId,
                 client_secret: clientSecret
                });


        return response.body.access_token;
    }
    return accessToken;
}

module.exports = getAccessToken;
