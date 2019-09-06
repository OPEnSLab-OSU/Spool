/**
 * Created by eliwinkelman on 9/5/19.
 */

import { useAuth0 } from "../../react-auth0-wrapper";
import React, { useState, useEffect } from 'react'

const RegisterDeviceForm = () => {

	const [showResult, setShowResult] = useState(false);
	const [apiMessage, setApiMessage] = useState({});
	const [deviceName, setDeviceName] = useState("");
	const {getTokenSilently} = useAuth0();

	const PostData = async (event) => {
		event.preventDefault();
		const data = new FormData(event.target);
		console.log('hello');
		const token = await getTokenSilently();
		console.log(data);
		console.log();
		const response = await fetch('/access/devices/register', {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify({name: deviceName})
		});
		const responseData = await response.json();
		setApiMessage(responseData);
		setShowResult(true);
	};

	const FormChange = (e) => {
		setDeviceName(e.target.value)
	};

	return (
		<>
	{!showResult && <div className="container-fluid">
		<div className="row">
			<div className="col-3"></div>
			<div className="col-6">
				<h1>Register Device</h1>

				<form onSubmit={PostData}>
					<div className="form-group">
						<label htmlFor="name">Device Name</label>
						<input onChange={FormChange} className="form-control" type="text" id="name" name="name" />
					</div>

					<button className="btn btn-primary">Download Configuration</button>
				</form>
			</div>
		</div>
	</div>}

		{showResult && NewDeviceInfo({info_raw: JSON.stringify(apiMessage)})}

		</>
	);
};


const NewDeviceInfo = (props) => {

	var url = 'data:text/plain;charset=utf-8,' + encodeURIComponent(props.info_raw);
	var downloadbutton = <a class="btn btn-primary" href={url} download="loom_configuration.json">Download</a>;

	return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-3"></div>
					<div className="col-6">
						<h1>New Device Info</h1>
						<p>Include this in your loom config</p>
						<code className="text-break">
							{props.info_raw}
						</code>
						<br />
						{downloadbutton}
					</div>
				</div>
			</div>
	);

};

export default RegisterDeviceForm;