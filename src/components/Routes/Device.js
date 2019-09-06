/**
 * Created by eliwinkelman on 9/5/19.
 */

import React, { useState, useEffect } from 'react'
import { useAuth0 } from "../../react-auth0-wrapper";

var Table = require('../table');

const DevicePage = (props) => {
	//this needs to be passed props.device and props.data where device is the device and data is an array of the data the device has collected sorted by timestamp.
	// also pass props.users which is an array of users with access to the device


		// eventually we should display which users are attached to a device

		/*
		 const users = this.props.users.map((user, index) => {
		 var link = "/u/user/" + user._id;
		 return <UserRow name={user.name} email={user.email} key={index} index={index} link={link}/>
		 });

		 var userBoard =
		 <div>
		 <table className="table table-hover">
		 <thead>
		 <tr>
		 <th scope="col">#</th>
		 <th scope="col">Email</th>
		 <th scope="col"></th>
		 </tr>
		 </thead>
		 <tbody>
		 {users}

		 </tbody>
		 </table>
		 </div>;*/

		// if there is data, display it in tabular format, otherwise don't display it

	const [showResult, setShowResult] = useState(false);
	const [apiMessage, setApiMessage] = useState({});
	const {getTokenSilently} = useAuth0();

	useEffect(() => {
		async function fetchData() {
			try {
				const token = await getTokenSilently();
				console.log(props.match.params.device);
				const response = await fetch("/access/devices/"+props.match.params.device, {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});

				const responseData = await response.json();
				console.log(responseData);
				setApiMessage(responseData);
				setShowResult(true)

			} catch (error) {
				console.error(error);
			}
		}

		fetchData();

	}, []);

	const confirmDeleteDevice = () => {

	};

	const deleteDevice = async () => {
		try {
			const token = await getTokenSilently();

			const response = await fetch("/access/devices/delete/"+props.match.params.device, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});
			props.history.push('/u/');
		}
		catch (error) {
			console.error(error)
		}
	};

	const dataTable = (data) => {
		var table;
		if (data.length !== 0) {
			table = <Table data={data}/>
		}
		else {
			table = <h5>This device has not reported any data yet.</h5>
		}
		return table;
	};

	const deviceDetails = (device) => {
		return <div className="row">
			<div className="col">
				<h3>Name: {device.name} </h3>
				<h4>Type: {device.type} </h4>
				<button onClick={deleteDevice} className="btn btn-danger">Delete</button>
				{/*<a href={'/u/device/delete/' + this.props.device.device_id} className="btn btn-danger">Delete</a>*/}
			</div>
		</div>
	};

	return (
		<>
		{showResult && <div className="container-fluid">
			{deviceDetails(apiMessage.device)}
			{dataTable(apiMessage.data)}
		</div>
		}
		</>
	)
};

export default DevicePage;
