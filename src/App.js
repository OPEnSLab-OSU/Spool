// src/App.js

import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Profile from "./components/Routes/Profile";
import Index from "./components/Routes/Index";
import Network from "./components/Routes/Network";
import {Helmet} from "react-helmet";
import NavBar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import ExternalApi from "./components/ExternalApi";
import Device from './components/Routes/Device';
import NewDevice from './components/Routes/NewDevice';
import Networks from './components/Routes/Networks';
import NewNetwork from './components/Routes/NewNetwork';

function App() {
	return (
		<div className="App">
			<Helmet>
				<title>Spool</title>
				<link
					rel="stylesheet"
					href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
					integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
					crossorigin="anonymous"
				/>
			</Helmet>
			{/* New - use BrowserRouter to provide access to /profile */}
			<BrowserRouter>
				<header>
					<NavBar />
				</header>
				<Switch>
					<Route path="/" exact component={Index}/>
					<PrivateRoute path="/profile" component={Profile}/>
					<PrivateRoute path="/external-api" component={ExternalApi}/>
					<PrivateRoute exact path="/u" component={Networks}/>
					<PrivateRoute path="/u/device/view/:device" component={Device}/>
					<PrivateRoute path="/u/device/register/:network" component={NewDevice}/>
					<PrivateRoute path="/u/networks/view/:network" component={Network} />
					<PrivateRoute path="/u/networks/register" component={NewNetwork}/>
				</Switch>
			</BrowserRouter>
		</div>
	);
}

export default App;
