/**
 * Created by eliwinkelman on 9/5/19.
 */

import React, { useState, useEffect } from 'react'
import { useAuth0 } from "../../react-auth0-wrapper";
import { accessDevice } from "../../api";
import DeviceDataTable from "../DeviceDataTable";
import DeviceDetails from '../DeviceDetails';

function DevicePage(props) {
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
			accessDevice(props.match.params.device, getTokenSilently, (data) => {
				setApiMessage(data);
				setShowResult(true);
			})
		}
		fetchData();
	}, []);

	const confirmDeleteDevice = () => {

	};




	return (
		<>
		{showResult && <div className="container-fluid">
			<DeviceDetails device={apiMessage.device}/>
			<DeviceDataTable data={apiMessage.data}/>
		</div>
		}
		</>
	)
};


export default DevicePage;
