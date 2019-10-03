/**
 * Created by eliwinkelman on 9/6/19.
 */

export async function accessDevices(getTokenSilently, callback) {
	try {

		const token = await getTokenSilently();
		const response = await fetch("/api/access/devices/", {
			mode: 'cors',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const responseData = await response.json();
		callback(responseData);

	} catch (error) {
		console.error(error);
	}
}

export async function accessDevice(device_id, getTokenSilently, callback) {
	try {
		const token = await getTokenSilently();
		
		const response = await fetch("/api/access/devices/info/"+device_id, {
			mode: 'cors',
			credentials: 'omit',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		const responseData = await response.json();
		
		callback(responseData);
		
	} catch (error) {
		console.error(error);
	}
}

export async function accessDeviceData(device_id, getTokenSilently, callback) {
	try {
		const token = await getTokenSilently();
		
		const response = await fetch("/api/access/devices/data/" + device_id, {
			credentials: 'omit',
			mode: 'cors',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		
		const responseDataJson = await response.json();
		let responseDataMap = {data: responseDataJson.data.map((data, index) => {
			return objToStrMap(data);
		})};
		
		callback(responseDataMap);
	} catch (error) {
		console.error(error);
	}
}

export async function deleteDevice (device_id, getTokenSilently, callback) {
	try {
		const token = await getTokenSilently();

		const response = await fetch("/api/access/devices/delete/"+device_id, {
			mode: 'cors',
			credentials: 'omit',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		callback();
		
	}
	catch (error) {
		console.error(error)
	}
}

export async function registerDevice (name, getTokenSilently, callback) {
	
	try {
		const token = await getTokenSilently();

		const response = await fetch('/api/access/devices/register', {
			credentials: 'omit',
			mode: 'cors',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({name: name})
		});
		const responseData = await response.json();
		
		callback(responseData);
	}
	catch(error) {
		console.error(error);
	}
	
}

export async function newVisualization(visualization, getTokenSilently, callback) {
	try {
		const token = await getTokenSilently();
		
		const response = await fetch('/api/access/visualization/new', {
			mode: 'cors',
			credentials: 'omit',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(visualization)
		});
		
		
		callback(response.status);
	}
	catch (error) {
		console.log(error);
	}
}

export async function getVisualizations(device_id, getTokenSilently, callback) {
	try {
		const token = await getTokenSilently();
		
		const response = await fetch('/api/access/visualization/'+device_id, {
			mode: 'cors',
			credentials: 'omit',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		
		const responseData = await response.json();
		console.log(responseData);
		callback(responseData);
	}
	
	catch (error ) {
		console.log(error);
	}
}

export async function updateVisualization(visualizationData, getTokenSilently, callback) {
	try {
		const token = await getTokenSilently();

		const response = await fetch('/api/access/visualization/update/', {
			mode: 'cors',
			credentials: 'omit',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(visualizationData)
		});


		callback(response.status);
	}
	catch (error) {
		console.log(error);
	}
}

export async function deleteVisualization(visualizationData, getTokenSilently, callback) {
	try {
		const token = await getTokenSilently();

		const response = await fetch('/api/access/visualization/delete/', {
			mode: 'cors',
			credentials: 'omit',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(visualizationData)
		});

		callback(response.status);
	}
	catch (error) {
		console.log(error);
	}
}

function strMapToObj(strMap) {
	let obj = Object.create(null);
	for (let [k,v] of strMap) {
		// We don’t escape the key '__proto__'
		// which can cause problems on older engines
		obj[k] = v;
	}
	return obj;
}
function objToStrMap(obj) {
	let strMap = new Map();
	for (let k of Object.keys(obj)) {
		strMap.set(k, obj[k]);
	}
	return strMap;
}