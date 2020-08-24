/**
 * Created by eliwinkelman on 9/5/19.
 * Created by eliwinkelman on 10/15/19.
 * Updated by smitmad9 on 7/20/20.
 */

import { useAuth0 } from "../../react-auth0-wrapper";
import React, { useState/*, useEffect */} from 'react';
import {Button, Row, Container, Col, Form} from 'react-bootstrap';
import { Link } from "react-router-dom";
import {newNetwork} from '../../api';

const RegisterNetworkForm = () => {

	const [showResult, setShowResult] = useState(false);
	const [apiMessage, setApiMessage] = useState({});
	const [networkName, setNetworkName] = useState("");
	const {getTokenSilently} = useAuth0();
	const [downloaded, setDownloaded] = useState(false);
	const [internetPlat, setInternetPlat] = useState(null);

	const PostData = async (event) => {
		event.preventDefault();

		newNetwork(networkName, getTokenSilently, (responseData) => {
			setApiMessage(responseData);
			setShowResult(true);
		})
	};

	const downloadButtonClick = () => {
		setDownloaded(true);
	};

	const FormChange = (e) => {
		setNetworkName(e.target.value)
	};

	const formatInfo = (info_raw, internet_plat) => {
		return {
			'name':'Spool',
			'params':[
				'Spool1',
				internet_plat !== null ? internet_plat : 'CHOOSE AN INTERNET PLATFORM!',
				info_raw.device_id,
				info_raw.device_id,
				info_raw.certificate,
				info_raw.private_key,
			'device.open-sensing.org',
			'/api/device/data'
		  ]
		}
	};

	return (
		<>
		{!showResult &&
		<Container fluid={true}>
			<Row>
				<Col sm={{span: 6, offset: 3}}>
					<h1>Register Network</h1>

					<form onSubmit={PostData}>
						<div className="form-group">
							<label htmlFor="name">Network Name</label>
							<input onChange={FormChange} className="form-control" type="text" id="name" name="name" />
						</div>

						<Button type="submit" variant="primary">Register</Button>
					</form>
				</Col>
			</Row>
		</Container>
		}

		{showResult ? NewDeviceInfo({internetPlat: internetPlat, setInternetPlat: setInternetPlat, info_raw: JSON.stringify(formatInfo(apiMessage, internetPlat)), downloaded: downloaded, downloadButtonClick: downloadButtonClick}) : null}

		</>
	);
};

const NewDeviceInfo = (props) => {



	let url = 'data:text/plain;charset=utf-8,' + encodeURIComponent(props.info_raw);


	let downloadbutton = <a href={url} download="loom_spool_configuration.json"><Button onClick={props.downloadButtonClick} variant="primary">Download</Button></a>;

	const onInternetPlatChange = (e) => {
		let plat = e.target.value;
		console.log(plat);

		switch(plat) {
			case "Ethernet":
				props.setInternetPlat(7001);
				break;
			case "WiFi":
				props.setInternetPlat(7002);
				break;
			case "LTE":
				props.setInternetPlat(7003);
				break;
			default:
				props.setInternetPlat(null);
		}

	};

	return (
		<Container fluid={true}>
			<Row>
				<Col sm={{span: 6, offset: 3}}>
					<h2>New Coordinator Info</h2>

					<p>Include this information in your coordinator's Loom config so your network can communicate with Spool!</p>

					<Form>
						<Form.Label>Choose an Internet Platform: </Form.Label>
						<Form.Group>
							<Form.Check onChange={onInternetPlatChange} inline type="radio" checked={props.internetPlat==7001} value="Ethernet" label="Ethernet" />
							<Form.Check onChange={onInternetPlatChange} inline type="radio" checked={props.internetPlat==7002} value="WiFi" label="WiFi" />
							<Form.Check onChange={onInternetPlatChange} inline type="radio" checked={props.internetPlat==7003} value="LTE" label="LTE" />
						</Form.Group>
					</Form>
					
					<div className="overflow-auto" style={{height: '150px'}}>
						<code className="text-break">
							{props.info_raw}
						</code>
					</div>
					<br />
					{!props.downloaded ? downloadbutton : <Link to="/u/"><Button variant="primary">Back to Dashboard</Button></Link>}
				</Col>
			</Row>
		</Container>
	);

};

export default RegisterNetworkForm;