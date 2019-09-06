/**
 * Created by eliwinkelman on 9/5/19.
 */

import { useAuth0 } from "../../react-auth0-wrapper";
import React, { useState, useEffect } from 'react'
import {Button, Row, Container, Col} from 'react-bootstrap'
import {registerDevice} from '../../api';

const RegisterDeviceForm = () => {

	const [showResult, setShowResult] = useState(false);
	const [apiMessage, setApiMessage] = useState({});
	const [deviceName, setDeviceName] = useState("");
	const {getTokenSilently} = useAuth0();

	const PostData = async (event) => {
		event.preventDefault();

		registerDevice(deviceName, getTokenSilently, (responseData) => {
			setApiMessage(responseData);
			setShowResult(true);
		})
	};

	const FormChange = (e) => {
		setDeviceName(e.target.value)
	};

	return (
		<>
	{!showResult &&
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
	}

		{showResult && NewDeviceInfo({info_raw: JSON.stringify(apiMessage)})}

		</>
	);
};


const NewDeviceInfo = (props) => {

	var url = 'data:text/plain;charset=utf-8,' + encodeURIComponent(props.info_raw);
	var downloadbutton = <a href={url} download="loom_configuration.json"><Button variant="primary">Download</Button></a>;

	return (
			<Container fluid={true}>
				<Row>
					<Col sm={{span: 6, offset: 3}}>
						<h1>New Device Info</h1>
						<p>Include this in your loom config</p>
						<code className="text-break">
							{props.info_raw}
						</code>
						<br />
						{downloadbutton}
					</Col>
				</Row>
			</Container>
	);

};

export default RegisterDeviceForm;