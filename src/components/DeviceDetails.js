/**
 * Created by eliwinkelman on 9/6/19.
 */

import React, { useState, useEffect } from 'react'
import { useAuth0 } from "../react-auth0-wrapper";
import {Row, Col, Button, Modal} from 'react-bootstrap'
import {withRouter} from 'react-router-dom'
import {deleteDevice} from '../api';

function DeviceDetails(props) {
	const {getTokenSilently} = useAuth0();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const handleClose = () => setShowDeleteConfirm(false);
	const handleShow = () => setShowDeleteConfirm(true);


	const onConfirmDelete = () => {
		deleteDevice(props.device.device_id, getTokenSilently, () => {props.history.push('/u/');})
	};


	return (
		<Row>
			<Col xs={10}>
				<h3>Name: {props.device.name} </h3>
			</Col>
			<Col xs={1}>
				<Button variant="danger" size="sm" onClick={handleShow}>Delete</Button>
			</Col>
			<Modal show={showDeleteConfirm} onHide={handleClose} centered>

				<Modal.Body>Are you sure you want to delete this device?<br/>
					This cannot be undone.</Modal.Body>
				<Modal.Footer>
					<Button variant="danger" onClick={onConfirmDelete}>
						Delete
					</Button>
					<Button variant="primary" onClick={handleClose}>
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>
		</Row>
	)
}

export default withRouter(DeviceDetails);