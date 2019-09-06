/**
 * Created by eliwinkelman on 9/6/19.
 */

export async function accessDevices(getTokenSilently, callback) {
	try {

		const token = await getTokenSilently();
		const response = await fetch("/access/devices/", {
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
		
		const response = await fetch("/access/devices/"+device_id, {
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

export async function deleteDevice (device_id, getTokenSilently, callback) {
	try {
		const token = await getTokenSilently();

		const response = await fetch("/access/devices/delete/"+device_id, {
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

		const response = await fetch('/access/devices/register', {
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
