/**
 * Created by eliwinkelman on 8/20/20.
 */

const Authenticator = require('auth0').AuthenticationClient;
const dotenv = require('dotenv');
const fs = require('fs');
const request = require('superagent');

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

const options = { method: 'POST',
  url: 'https://' + process.env.AUTH0_DOMAIN + '/oauth/token',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  form:
   { grant_type: 'password',
     username: process.env.AUTH0_TEST_USERNAME,
     password: testUserPassword,
     audience: process.env.AUTH0_AUDIENCE,
     client_id: clientId,
     client_secret: clientSecret }
   };


async function getAccessToken() {

    const response = await request.post('https://' + process.env.AUTH0_DOMAIN + '/oauth/token')
        .type('form')
        .send({ grant_type: 'password',
                 username: process.env.AUTH0_TEST_USERNAME,
                 password: testUserPassword,
                 audience: process.env.AUTH0_AUDIENCE,
                 client_id: clientId,
                 client_secret: clientSecret
                });


    return response.body.access_token;
}

module.exports = getAccessToken;
