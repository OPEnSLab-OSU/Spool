/**
 * Created by eliwinkelman on 10/15/19.
 */

/**
 * Created by eliwinkelman on 9/4/19.
 */

import React, { useState, useEffect }from 'react'
import { useAuth0 } from "../../react-auth0-wrapper";
import { Link } from "react-router-dom";
import { accessNetworkDevices, accessNetwork } from '../../api';
import { Table, Container, Col, Row, Button, Card, CardColumns } from 'react-bootstrap'
import NetworkDetails from '../NetworkDetails';

const Network = (props) => {
	const [showDevices, setShowDevices] = useState(false);
	const [showNetwork, setShowNetwork] = useState(false);
	const [devices, setDevices] = useState([]);
	const [network, setNetwork] = useState({});
	const {getTokenSilently} = useAuth0();

	useEffect(() => {
		async function fetchData() {
			accessNetworkDevices(props.match.params.network, getTokenSilently, (network) => {

				setDevices(network.devices);
				setShowDevices(true);
			});

			accessNetwork(props.match.params.network, getTokenSilently, (network) => {
				setNetwork(network);
				setShowNetwork(true);
			})
		}
		fetchData();
	}, []);

	const deviceDisplay = (devices) => {
		return devices.map((device, index) => {
			return <DeviceRow name={device.name} index={index} device_id={device.device_id}/>
		});
	};

	return (
		<>
		<Container fluid={true}>

			{showNetwork && <NetworkDetails network={network}/>}
		</Container>

		<Container fluid={true}>
			<Table bordered hover>
				<thead>
					<th>Number</th>
					<th>Name</th>
					<th>View</th>
				</thead>
				<tbody>
				{showDevices && deviceDisplay(devices)}
				</tbody>
			</Table>
			<Row>
				<Col>
					<Link to={"/u/device/register/" + props.match.params.network}>
						<Button variant="primary">Register New Device</Button>
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
				<td><Link to={"/u/device/view/"+this.props.device_id}>View</Link></td>
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

export default Network;