/**
 * Created by eliwinkelman on 9/4/19.
 */

import React, { useState, useEffect }from 'react'
import { useAuth0 } from "../../react-auth0-wrapper";
import { Link } from "react-router-dom";
import { accessDevices } from '../../api';
import { Container, Col, Row, Button, Card, CardColumns } from 'react-bootstrap'

const Dashboard = () => {
	const [showResult, setShowResult] = useState(false);
	const [apiMessage, setApiMessage] = useState({devices: []});
	const {getTokenSilently} = useAuth0();

	useEffect(() => {
		async function fetchData() {
			accessDevices(getTokenSilently, (devices) => {
				setApiMessage(devices);
				setShowResult(true);
			});
		}
		fetchData();
	}, []);
	
	const deviceDisplay = (devices) => {
		return devices.map((device, index) => {
				return <div key={device.device_id} className="col" style={{paddingBottom: "10px"}}><DevicePanel  name={device.name}
				                                                                         type={device.type} device_id={device.device_id}/></div>
		});
	};

	return (
		<>
			<CardColumns>
			{showResult && deviceDisplay(apiMessage.devices)}
			</CardColumns>
			<Container fluid={true}>
				<Row>
					<Col>
						<Link to="/u/device/register">
							<Button variant="primary" size="lg">Register New Device</Button>
						</Link>
					</Col>
				</Row>
			</Container>
		</>
	);
};

class DeviceRow extends React.Component {
	render() {
		return (
			<tr>
				<th scope="row">{this.props.index}</th>
				<td>{this.props.name}</td>
				<td><a href={this.props.link} className="btn btn-primary">View</a></td>
			</tr>
		)
	}
}

class DevicePanel extends  React.Component {
	render() {
		return (
			<Card>
				<Card.Body>
					<Card.Title>{this.props.name}</Card.Title>
					<Card.Text>
						<Link to={"/u/device/view/"+this.props.device_id}>
							<Button variant="primary">View</Button>
						</Link>
					</Card.Text>
				</Card.Body>
			</Card>
		)
	}
}

export default Dashboard;