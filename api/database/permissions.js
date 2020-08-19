/**
 * Created by eliwinkelman on 8/13/20.
 */

/**
 * @class Permissions
 */
class Permissions {

    /**
     * @constructor
     * @param {Object} permissions - a permissions data object, stored with keys as user_ids and key values as arrays of permission names.
     */
    constructor(permissions) {
        if (permissions !== null && permissions !== undefined){
            this.permissions = permissions
        }
        else {
            this.permissions = {}
        }
    }

    /**
     * Adds a permission to a user
     * @param {string} permission_name - the name of the permission
     * @param {string} user_id - the id of the user to add the permission for
     */
    add(permission_name, user_id){

        if (user_id in this.permissions) {
            this.permissions[user_id].push(permission_name);
        }
        else {
            this.permissions[user_id] = [permission_name]
        }
    }

    /**
     * Removes a permission from a user. If a user has no permissions left after the removal,
     * they are removed from the permissions object.
     * @param {string} permission_name - the name of the permission
     * @param {string} user_id - the id of the user to remove the permission from
     */
    remove(permission_name, user_id){
        if (user_id in this.permissions) {
            let index = 0;
            while(true){
                index = this.permissions[user_id].indexOf(permission_name);
                if (index === -1){ break }
                this.permissions[user_id].splice(index, 1);
            }

            // if the user has no permissions remove them from the permissions object.
            if (this.permissions[user_id].length == 0) {
			    delete this.permissions[user_id];
		    }
        }
    }

    /**
     * Checks if a user has any permissions
     * @param {string} user_id - the id of the user to check permissions for.
     * @returns {boolean} true if they have any permissions
     */
    has_permissions(user_id) {
        return this.permissions.hasOwnProperty(user_id);
    }

    /**
     * Checks if a user has a specific permission
     * @param {string} permission_name - the name of the permission to check for
     * @param {string} user_id - the id of the user to check permissions for
     * @returns {boolean} true if they have the permission
     */
    check(permission_name, user_id) {
        if (user_id in this.permissions) {
            for (const permission of this.permissions[user_id]) {
                if (permission_name === permission){
                    return true;
                }
            }
        }
        return false
    }
}

module.exports = Permissions;