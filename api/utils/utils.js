/**
 * Created by eliwinkelman on 9/20/19.
 */


function strMapToObj(strMap) {
	let obj = Object.create(null);
	for (let [k,v] of strMap) {
		// We don’t escape the key '__proto__'
		// which can cause problems on older engines
		obj[k] = v;
	}
	return obj;
}

module.exports = {
	strMapToObj: strMapToObj
};