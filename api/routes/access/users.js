/**
 * Created by eliwinkelman on 8/14/20.
 */


const express = require('express');
const router = express.Router();
const secured = require('../../lib/middleware/secured');
const {wrapAsync}  = require('../../lib/middleware/middleware');
const Auth0UserManager = require('../../database/models/user');


/**
 *  @swagger
 *  /access/users/reset-password/}:
 *      post:
 *          description: Sends a email for the requesting user to reset their password.
 *          tags:
 *              - access
 *              - users
 *
 */
router.post('/reset-password', secured, wrapAsync(async (req, res, next) => {

    await Auth0UserManager.resetUserPassword(req.apiUser);
    res.sendStatus(200)
}));


/**
 *  @swagger
 *  /access/users/search/{query}}:
 *      get:
 *          description: Searches auth0 users with a query.
 *          tags:
 *              - access
 *              - users
 *          parameters:
 *              - in: path
 *                name: query
 *                schema:
 *                  type: string
 *                required: true
 *                description: A search query.
 */
router.get('/search/:query', secured, wrapAsync(async (req, res, next) => {

    const users = await Auth0UserManager.searchAuth0Users(req.params.query);
    console.log(users);

    const usersWithSpoolIds = await Promise.all(users.map(async (user) => {
        let spoolUser = await Auth0UserManager.getByAuth0Id(user.user_id);

        let spoolUserId;
        if (spoolUser === undefined) {
            // create a user
            spoolUserId = await Auth0UserManager.create(user.user_id);

        }
        else {
            spoolUserId = spoolUser._id;
        }
        return {...user, _id: spoolUserId}
    }));

    console.log("users");
    console.log(usersWithSpoolIds);

    res.send(usersWithSpoolIds);

}));

/**
 *  @swagger
 *  /access/users/info/{user}:
 *      get:
 *          description: Gets auth0 user info (username and email) for a user in the Spool database.
 *          tags:
 *              - access
 *              - users
 *          parameters:
 *              - in: path
 *                name: user
 *                schema:
 *                  type: string
 *                required: true
 *                description: The id (in the spool database) of the user to get auth0 info for.
 */
router.get('/info/:user', secured, wrapAsync(async (req, res, next) => {
    const user = await Auth0UserManager.get(req.params.user);

    const auth0User = await Auth0UserManager.getAuth0User(user);

    res.send({username: auth0User.username, email: auth0User.email});
}));

module.exports = router;