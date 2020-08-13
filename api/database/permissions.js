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

        if (permission_name in this.permissions) {
            this.permissions[permission_name].push(user_id);
        }
        else {
            this.permissions[permission_name] = [user_id]
        }
        console.log(this.permissions[permission_name]);
    }

    remove(permission_name, user_id){
        if (permission_name in this.permissions) {
            let index = 0;
            while(index !== -1){
                index = this.permissions[permission_name].indexOf(user_id);
                array.splice(index, 1);
            }
        }
    }

    check(permission_name, user_id) {
        if (permission_name in this.permissions) {
            for (const user of this.permissions[permission_name]) {

                if (user_id.toString() === user.toString()){
                    return true;
                }
            }
        }
        return false
    }
}

module.exports = Permissions;