/**
 * Created by eliwinkelman on 9/4/19.
 * src/components/NavBar.js
 */

import React from "react";
import { useAuth0 } from "../react-auth0-wrapper";
import { Link } from "react-router-dom";

const NavBar = () => {
	const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

	return (
	<div className="navbar navbar-expand">
		<div className="collapse navbar-collapse" id="navbarSupportedContent">
			<ul className="navbar-nav ml-auto">
				<li className="nav-item">
					<Link className="nav-link" to="/u/">Dashboard<span class="sr-only">(current)</span></Link>
				</li>
				<li className="nav-item">
					<Link className="nav-link" to="/profile">Profile</Link>
				</li>
				<li className="nav-item">
					{!isAuthenticated && (<button className="btn btn-outline-primary" onClick={() => loginWithRedirect({})}>Log in</button>)}
					{isAuthenticated && <button className="btn btn-outline-primary" onClick={() => logout()}>Log out</button>}
				</li>
			</ul>
		</div>
	</div>
	);
};

export default NavBar;