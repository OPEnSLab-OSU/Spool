/**
 * Created by eliwinkelman on 9/20/19.
 */
const AuthenticationClient = require('auth0').AuthenticationClient;
const { DatabaseInterface } = require('../db');
const ManagementClient = require('auth0').ManagementClient;
const ObjectID = require('mongodb').ObjectID;

const dotenv = require('dotenv');
const fs = require('fs');

const readOptions = {
	encoding: "utf8"
};
dotenv.config();

const clientIdPath = "/run/secrets/clientId.txt";
const clientId = fs.readFileSync(clientIdPath, readOptions);

const clientSecretPath = "/run/secrets/clientSecret.txt";
const clientSecret = fs.readFileSync(clientSecretPath, readOptions);

const auth0Authentication = new AuthenticationClient({
    domain: process.env.AUTH0_DOMAIN,
    clientId: clientId
});

const auth0Management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: clientId,
  clientSecret: clientSecret,
  scope: 'read:users'
});

class Auth0UserManager extends DatabaseInterface {

    static async getCollection() {
		return super.getCollection("Users")
	}

	static async get(id) {
        const Users = await this.getCollection();
		const users = await Users.find({_id: new ObjectID(id)}).toArray();

		return users[0];
    }

    static async update(id, update) {
        const Users = await this.getCollection();
		const _ = await Users.update({_id: new ObjectID(id)}, update);
        return true
    }

    static async addNetworkToUser(id, network_id) {
        const Users = await this.getCollection();

        const updateUser = await this.update(id, {$addToSet: {networks: network_id}});

        return true
    }

    static async removeNetworkFromUser(id, network_id) {

        const Users = await this.getCollection();

        const updateUser = await this.update(id, {$pull: {networks: network_id}});
        console.log(updateUser);
        return true;
    }

    static async create(auth0_id) {
        const Users = await this.getCollection();

        const user = await Users.insertOne({
            auth0_id: auth0_id,
            devices: [],
            role: "user"
        }).catch((err) => {
            throw err;
        });

        return user.insertedId;
    }

    static async getByAuth0Id(auth0_id) {
        const Users = await this.getCollection();
        const users = await Users.find({auth0_id: auth0_id}).toArray();

        return users[0];
    }

    static async resetUserPassword(user) {
        const auth0_user = await this.getAuth0User(user);

        auth0Authentication.requestChangePasswordEmail({
            email: auth0_user.email,
            connection: process.env.AUTH0_CONNECTION,
            client_id: clientId
        }, () => {})
    }

    static async getAuth0User(user) {
        const auth0_id = user.auth0_id;

        return await auth0Management.getUser({id: auth0_id});
    }

    static async searchAuth0Users(search) {
        const users = await auth0Management.getUsers({
            q: search,
            per_page: 10,
            page: 0
        }).catch(error => {return []});

        const filteredUsers = users.filter((user) => {
            for (let identity of user.identities) {

                if (identity.connection === process.env.AUTH0_CONNECTION) {
                   return true;
                }
            }
            return false;
        });

        return filteredUsers.map((user) => {
            return {
                email: user.email,
                username: user.username,
                user_id: user.user_id
            }
        })
    }
}

module.exports = Auth0UserManager;