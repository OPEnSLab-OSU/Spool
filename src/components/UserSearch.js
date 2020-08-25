/**
 * Created by eliwinkelman on 8/14/20.
 */

// src/components/UserSearch.js

import React, {useState} from "react";
import { searchUsers } from '../api';
import { useAuth0 } from "../react-auth0-wrapper";
import {ListGroup} from 'react-bootstrap';
import '../App.css'

const UserSearch = (props) => {
	const { getTokenSilently} = useAuth0();

	const [users, setUsers] = useState([]);

	async function searchFormChange(e) {
		await searchUsers(e.target.value, getTokenSilently, (usersFound) => {
			setUsers(usersFound)
		});
	}

	function onClickUser(index) {
		const user = users[index];
		props.onSelectUser(user);
	}

	return (
		<div className="user-search">
		<input placeholder="Search users" autoComplete="off" onChange={searchFormChange} className="form-control" type="text" id="name" name="name" />
     	<ListGroup className="user-search-results" variant="flush">
			{users.map((item, index) => (
				<ListGroup.Item key={index} className="user-item"><div><b>{item.username}</b><br />{item.email}</div><i onClick={() => {onClickUser(index); setUsers(users.filter((el, i) => {return i !== index}))}} className="fas fa-plus add-user" /></ListGroup.Item>
			))}
		</ListGroup>
		</div>
	);
};

export default UserSearch;