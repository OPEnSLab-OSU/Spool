/**
 * Created by eliwinkelman on 9/4/19.
 * src/components/NavBar.js
 */

import React from "react";
import { useAuth0 } from "../react-auth0-wrapper";
import { Link, withRouter} from "react-router-dom";
import { Navbar, Nav, Button } from 'react-bootstrap'
const NavBar = (props) => {
	const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

	return (
	<Navbar expand="sm" bg="light" className="mb-5">
		<Navbar.Toggle aria-controls="basic-navbar-nav" />

		<Navbar.Collapse id="navbarSupportedContent">
			<Nav className="mr-auto">
				<Nav.Item>
					<Link className="nav-link" to="/u/">Dashboard<span className="sr-only">(current)</span></Link>
				</Nav.Item>
				<Nav.Item>
					<Link className="nav-link" to="/profile">Profile</Link>
				</Nav.Item>
				<Nav.Item>
					{!isAuthenticated && (<Button variant="outline-primary" onClick={() => loginWithRedirect({})}>Log in</Button>)}
					{isAuthenticated && <Button variant="outline-primary" onClick={() => logout()}>Log out</Button>}
				</Nav.Item>
			</Nav>
		</Navbar.Collapse>
		{isAuthenticated
			&& props.location.pathname !== '/u/'
		&&
			<Nav className="justify-content-end">
				<Nav.Item>
					<Button variant="secondary" onClick={() => {props.history.goBack()}}>
						Back
					</Button>
				</Nav.Item>
			</Nav>
		}

	</Navbar>
	);
};

export default withRouter(NavBar);