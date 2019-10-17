/**
 * Created by eliwinkelman on 10/15/19.
 */

/**
 * Created by eliwinkelman on 9/4/19.
 */

import React, { useState, useEffect }from 'react'
import { useAuth0 } from "../../react-auth0-wrapper";
import { Link } from "react-router-dom";
import { accessNetworks } from '../../api';
import { Table, Container, Col, Row, Button, Card, CardColumns } from 'react-bootstrap'

const Networks = () => {
	const [showResult, setShowResult] = useState(false);
	const [apiMessage, setApiMessage] = useState({devices: []});
	const {getTokenSilently} = useAuth0();

	useEffect(() => {
		async function fetchData() {
			accessNetworks(getTokenSilently, (networks) => {
				setApiMessage(networks);
				setShowResult(true);
			});
		}
		fetchData();
	}, []);

	const networkDisplay = (networks) => {
		return networks.map((network, index) => {
			return <NetworkRow name={network.name} index={index} id={network._id}/>

		});
	};

	return (
		<>

		<Container fluid={true}>
			<Row>
				<Col>
					<h1>Networks</h1>
				</Col>
			</Row>
			<Row>
				<Table>
					<thead>
						<th>Number</th>
						<th>Name</th>
						<th>View</th>
					</thead>
					<tbody>
					{showResult && networkDisplay(apiMessage)}
					</tbody>
				</Table>
			</Row>
			<Row>
				<Col>
					<Link to="/u/networks/register">
						<Button variant="primary" size="lg">Register New Network</Button>
					</Link>
				</Col>
			</Row>
		</Container>
		</>
	);
};

class NetworkRow extends React.Component {
	render() {
		return (
			<tr>
				<th scope="row">{this.props.index}</th>
				<td>{this.props.name}</td>
				<td><Link to={"/u/networks/view/"+this.props.id}>View</Link></td>
			</tr>
		)
	}
}

class Panel extends  React.Component {
	render() {
		return (
			<Card>
				<Card.Body>
					<Card.Title>{this.props.name}</Card.Title>
					<Card.Text>
						<Link to={"/u/networks/view/"+this.props.id}>
							<Button variant="primary">View</Button>
						</Link>
					</Card.Text>
				</Card.Body>
			</Card>
		)
	}
}

export default Networks;