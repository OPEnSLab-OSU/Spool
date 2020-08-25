/**
 * Created by eliwinkelman on 10/15/19.
 */

/**
 * Created by eliwinkelman on 9/4/19.
 */

import React, { useState, useEffect }from 'react'
import { useAuth0 } from "../../react-auth0-wrapper";
import { Link } from "react-router-dom";
import { accessNetworkDevices, accessNetwork, getMyUserId } from '../../api';
import { Table, Container, Col, Row, Button } from 'react-bootstrap'
import NetworkDetails from '../NetworkDetails';
import AddUserPermissionsModal from '../AddUserPermissions';

const Network = (props) => {
	const [showDevices, setShowDevices] = useState(false);
	const [showNetwork, setShowNetwork] = useState(false);
	const [devices, setDevices] = useState([]);
	const [network, setNetwork] = useState({});
	const {getTokenSilently} = useAuth0();
	const [myId, setMyId] = useState(null);

	useEffect(() => {
		async function fetchData() {
			accessNetworkDevices(props.match.params.network, getTokenSilently, (network) => {
				if (network !== undefined && network.devices !== undefined) {
					setDevices(network.devices);
				}
				setShowDevices(true);
			});

			accessNetwork(props.match.params.network, getTokenSilently, (network) => {
				if (network !== undefined) {
					setNetwork(network);

				}
				setShowNetwork(true);
			});

			getMyUserId(getTokenSilently, setMyId)
		}
		fetchData();
	}, [getTokenSilently, props.match.params.network]);

	const deviceDisplay = (devices) => {
		return devices.map((device, index) => {
			return <DeviceRow name={device.name} key={index} index={index} device_id={device.device_id}/>
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
					<tr>
						<th>Number</th>
						<th>Name</th>
						<th>View</th>
					</tr>
				</thead>
				<tbody>
				{showDevices && deviceDisplay(devices)}
				</tbody>
			</Table>
			{myId !== null && showNetwork &&
			network.permissions[myId].includes('edit') &&
			<Row>
				<Col>
					<Link to={"/u/device/register/" + props.match.params.network}>
						<Button variant="primary">Register New Device</Button>
					</Link>
				</Col>
			</Row>
			}

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

export default Network;