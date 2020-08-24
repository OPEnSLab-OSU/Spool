/**
 * Created by eliwinkelman on 9/4/19.
 */

// src/components/Profile.js

import React, {useState} from "react";
import { resetPassword, searchUsers } from '../../api';
import { useAuth0 } from "../../react-auth0-wrapper";
import { Button, Col, Row, Container, Figure } from 'react-bootstrap'

const Profile = () => {
	const { loading, user, getTokenSilently} = useAuth0();

	if (loading || !user) {
		return (
			<div>Loading...</div>
		);
	}

	function onClickPasswordReset() {
		resetPassword(getTokenSilently);
	}


	return (
		<Container fluid={true}>
			<Row>
				<Col sm={{span: 6, offset: 3}} className="text-center">

					<Figure>
					  <Figure.Image
						width={180}
						thumbnail src={user.picture} alt="Profile"
					  />
					</Figure>

					<h2>{user.nickname}</h2>
					<p>{user.email}</p>
					<br />
					<Button onClick={onClickPasswordReset}>Reset Password</Button>

					<br />
				</Col>
			</Row>
		</Container>
	);
};

export default Profile;