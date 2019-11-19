/**
 * Created by eliwinkelman on 9/5/19.
 */

import { useAuth0 } from "../../react-auth0-wrapper";
import React, { useState, useEffect } from 'react'
import {Button, Row, Container, Col} from 'react-bootstrap'
import {registerDevice} from '../../api';
import {withRouter} from 'react-router-dom';


const RegisterDeviceForm = (props) => {

	const [deviceName, setDeviceName] = useState("");
	const {getTokenSilently} = useAuth0();

	const PostData = async (event) => {
		event.preventDefault();

		registerDevice(deviceName, props.match.params.network, getTokenSilently, (responseData) => {
			props.history.push('/u/networks/view/'+props.match.params.network)
		})
	};

	const FormChange = (e) => {
		setDeviceName(e.target.value)
	};

	return (

		<Container fluid={true}>
			<Row>
				<Col sm={{span: 6, offset: 3}}>
					<h1>Register Device</h1>

					<form onSubmit={PostData}>
						<div className="form-group">
							<label htmlFor="name">Device Name</label>
							<input onChange={FormChange} className="form-control" type="text" id="name" name="name" />
						</div>

						<Button type="submit" variant="primary">Register</Button>
					</form>
				</Col>
			</Row>
		</Container>

	);
};

export default withRouter(RegisterDeviceForm);