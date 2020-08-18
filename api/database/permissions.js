/**
 * Created by eliwinkelman on 8/13/20.
 */

class Permissions {

    constructor(permissions) {
        if (permissions !== null && permissions !== undefined){
            this.permissions = permissions
        }
        else {
            this.permissions = {}
        }
    }

    add(permission_name, user_id){

        if (user_id in this.permissions) {
            this.permissions[user_id].push(permission_name);
        }
        else {
            this.permissions[user_id] = [permission_name]
        }
    }

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

    has_permissions(user_id) {
        console.log(this.permissions.hasOwnProperty(user_id));
        return this.permissions.hasOwnProperty(user_id);
    }

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