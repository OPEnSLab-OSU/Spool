/**
 * Created by eliwinkelman on 9/5/19.
 */

import React, { useState, useEffect } from 'react'
import { useAuth0 } from "../../react-auth0-wrapper";
import { accessDevice, accessDeviceData } from "../../api";
import DeviceDataTable from "../DeviceDataTable";
import DeviceDetails from '../DeviceDetails';
import VisualizationDashboard from '../Visualizations/VisualizationDashboard'

import { Container, Tabs, Tab } from 'react-bootstrap'

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
	
	const [showDevice, setShowDevice] = useState(false);
	const [showData, setShowData] = useState(false);
	const [device, setDevice] = useState({});
	const [data, setData] = useState({});
	const {getTokenSilently} = useAuth0();
	
	useEffect(() => {
		async function fetchData() {
			accessDevice(props.match.params.device, getTokenSilently, (device) => {
				setDevice(device);
				setShowDevice(true);
			});

			accessDeviceData(props.match.params.device, getTokenSilently, (data) => {
				setData(data);
				console.log(data);
				setShowData(true);
			});
		}
		fetchData();
	}, []);
	
	return (

		<Container fluid={true}>
			{showDevice && <DeviceDetails device={device.device} /> }

			<Tabs>
				<Tab eventKey="Data" title="Data">
					{showData && <DeviceDataTable data={data.data}/> }
				</Tab>
				<Tab eventKey="Visualizations" title="Visualizations">
					{showData && <VisualizationDashboard device_id={props.match.params.device} deviceData={data.data}/>}
				</Tab>
			</Tabs>

		</Container>
	)
}

export default DevicePage;
