/**
 * Created by eliwinkelman on 10/17/19.
 */

import React, { useState, useEffect } from 'react'
import { useAuth0 } from "../react-auth0-wrapper";
import {Row, Col, Button, Modal} from 'react-bootstrap'
import {withRouter} from 'react-router-dom'
import {deleteNetwork} from '../api';

function NetworkDetails(props) {
	const {getTokenSilently} = useAuth0();
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const handleClose = () => setShowDeleteConfirm(false);
	const handleShow = () => setShowDeleteConfirm(true);

	const onConfirmDelete = () => {
		deleteNetwork(props.network._id, getTokenSilently, () => {props.history.push('/u/');})
	};

	return (
		<Row>
			<Col xs={10}>
				<h3>Network: {props.network.name} </h3>
			</Col>
			<Col xs={1}>
				<Button variant="danger" size="sm" onClick={handleShow}>Delete</Button>
			</Col>
			<Modal show={showDeleteConfirm} onHide={handleClose} centered>

				<Modal.Body>Are you sure you want to delete this network?<br/>
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

export default withRouter(NetworkDetails);
