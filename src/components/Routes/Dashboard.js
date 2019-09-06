/**
 * Created by eliwinkelman on 9/4/19.
 */

import React, { useState, useEffect }from 'react'
import { useAuth0 } from "../../react-auth0-wrapper";
import { Link } from "react-router-dom";

const Dashboard = () => {
	const [showResult, setShowResult] = useState(false);
	const [apiMessage, setApiMessage] = useState({devices: []});
	const {getTokenSilently} = useAuth0();
	
	useEffect(() => {
		async function fetchData() {
			try {
				const token = await getTokenSilently();
	
				const response = await fetch("/access/devices/", {
					headers: {
						Authorization: `Bearer ${token}`
					}
				});
	
				const responseData = await response.json();
	
				setApiMessage(responseData);
				setShowResult(true)
	
			} catch (error) {
				console.error(error);
			}
		}
		fetchData();
	}, []);
	
	const deviceDisplay = (devices) => {
		return devices.map((device, index) => {
				return <div key={device.device_id} className="col" style={{paddingBottom: "10px"}}><DevicePanel  name={device.name}
				                                                                         type={device.type}
				                                                                         device_id={device.device_id}/></div>
		});
	};

	return (
			<div className="container-fluid">

				<div className="row">
					{showResult && deviceDisplay(apiMessage.devices)}
				</div>

				<div className = "row">
					<div className="col">
						<Link to="/u/device/register" className="btn btn-lg btn-primary">Register New Device</Link>
					</div>
				</div>
			</div>
	);
};

class DeviceRow extends React.Component {

	render() {
		return (

			<tr>
				<th scope="row">{this.props.index}</th>
				<td>{this.props.name}</td>
				<td>{this.props.type}</td>
				<td><a href={this.props.link} className="btn btn-primary">View</a></td>
			</tr>

		)
	}
}

class DevicePanel extends  React.Component {
	render() {
		return (

			<div className="card">
				<div className="card-body">
					<h5 className="card-title">{this.props.name}</h5>
					<h6 className="card-subtitle mb-2 text-muted">{this.props.type}</h6>
					<Link to={"/u/device/view/"+this.props.device_id} className="btn btn-primary">View</Link>
				</div>
			</div>
		)
	}
}

export default Dashboard;