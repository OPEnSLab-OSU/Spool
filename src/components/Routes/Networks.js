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
import { Table, Container, Col, Row, Button } from 'react-bootstrap'

const Networks = () => {
	const [showResult, setShowResult] = useState(false);
	const [apiMessage, setApiMessage] = useState([]);
	const {getTokenSilently} = useAuth0();

	useEffect(() => {
		async function fetchData() {
			accessNetworks(getTokenSilently, (networks) => {
				if (networks !== undefined) {
					setApiMessage(networks);
				}
				setShowResult(true);
			});
		}
		fetchData();
	}, [getTokenSilently]);

	const networkDisplay = (networks) => {
		return networks.map((network, index) => {
			return <NetworkRow name={network.name} key={index} index={index} id={network._id}/>
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
						<tr>
							<th>Number</th>
							<th>Name</th>
							<th>View</th>
						</tr>
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

export default Networks;