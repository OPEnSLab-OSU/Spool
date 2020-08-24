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

/**
 * @class
 * @implements DatabaseInterface
 */
class Auth0UserManager extends DatabaseInterface {

    /**
	 * Helper function to get the collection of users.
	 * @returns {Object} The MongoDB collection for users.
	 */
    static async getCollection() {
		return super.getCollection("Users")
	}

    /**
	 * Gets the user with id.
	 * @param {string} id - The id of the user (this is the id in the Spool database, not the auth0 id).
	 * @returns {Promise.<Object>} A user object from the MongoDB.
	 */
	static async get(id) {
        const Users = await this.getCollection();
		const users = await Users.find({_id: new ObjectID(id)}).toArray();

		return users[0];
    }

    /**
     * Updates a user object.
     * @param {string} id - the id of the user to update.
     * @param {Object} update - an update object (see mongodb documentation for examples).
     * @returns {Promise.<boolean>}
     */
    static async update(id, update) {
        const Users = await this.getCollection();
		const _ = await Users.update({_id: new ObjectID(id)}, update);
        return true
    }

    /**
     * Adds a network to a user.
     * @param id - the id of the user.
     * @param network_id - the id of the network.
     * @returns {Promise.<boolean>}
     */
    static async addNetworkToUser(id, network_id) {
        const Users = await this.getCollection();

        const updateUser = await this.update(id, {$addToSet: {networks: network_id}});

        return true
    }

    /**
     * Removes a network from a user.
     * @param id - the id of the user.
     * @param network_id - the id of the network.
     * @returns {Promise.<boolean>}
     */
    static async removeNetworkFromUser(id, network_id) {

        const Users = await this.getCollection();

        const updateUser = await this.update(id, {$pull: {networks: network_id}});

        return true;
    }

    /**
     * Creates a user in the database for the specified auth0 id.
     * @param auth0_id - the auth0 id to make a user for.
     * @returns {Promise.<ObjectId|*>}
     */
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

    /**
     * Gets a user from the database by their auth0 id.
     * @param auth0_id - the auth0 id of the user to get.
     * @returns {Promise.<*>}
     */
    static async getByAuth0Id(auth0_id) {
        const Users = await this.getCollection();
        const users = await Users.find({auth0_id: auth0_id}).toArray();

        // if the user exists, return, otherwise create and try again
        if (Array.isArray(users) && users.length !== 0) {
            return users[0];
        }
        else {
            await this.create(auth0_id);
            return await this.getByAuth0Id(auth0_id);
        }
    }

    /**
     * Sends a password reset email for user.
     * @param user - the user to send the password reset email for.
     * @returns {Promise.<void>}
     */
    static async resetUserPassword(user) {
        const auth0_user = await this.getAuth0User(user);

        auth0Authentication.requestChangePasswordEmail({
            email: auth0_user.email,
            connection: process.env.AUTH0_CONNECTION,
            client_id: clientId
        }, () => {})
    }

    /**
     * Gets the auth0 user object (in the auth0 database) tied to a user.
     * @param {Object} user - the user to get the auth0 user for.
     * @returns {Promise.<{Object}>} The auth0 user object
     */
    static async getAuth0User(user) {
        const auth0_id = user.auth0_id;

        return await auth0Management.getUser({id: auth0_id});
    }

    /**
     * Searches all the auth0 users with access to this application.
     * @param {string} search - a search query. See https://auth0.com/docs/users/user-search/user-search-query-syntax for the query syntax
     * @returns {Promise.<[Object]>} an array of user objects with only their email, username, and id.
     */
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
