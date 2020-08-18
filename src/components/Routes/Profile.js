/**
 * Created by eliwinkelman on 9/4/19.
 */

// src/components/Profile.js

import React, {useState} from "react";
import { resetPassword, searchUsers } from '../../api';
import { useAuth0 } from "../../react-auth0-wrapper";
import { Button } from 'react-bootstrap'

const Profile = () => {
	const { loading, user, getTokenSilently} = useAuth0();

	const [search, setSearch] = useState("");
	const [users, setUsers] = useState([]);

	if (loading || !user) {
		return (
			<div>Loading...</div>
		);
	}

	function onClickPasswordReset() {
		resetPassword(getTokenSilently);
	}

	async function searchFormChange(e) {
		await searchUsers(e.target.value, getTokenSilently, (usersFound) => {
			console.log(usersFound);
			setUsers(usersFound)
		});
	}

	return (
		<>
		<img src={user.picture} alt="Profile" />

		<h2>{user.name}</h2>
		<p>{user.email}</p>
		<code>{JSON.stringify(user, null, 2)}</code>
		<br />
		<Button onClick={onClickPasswordReset}>Reset Password</Button>

		<br />
		</>
	);
};

export default Profile;