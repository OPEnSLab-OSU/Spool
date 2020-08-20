// src/index.js

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { Auth0Provider } from "./react-auth0-wrapper";

// A function that routes the user to the right place
// after login
const onRedirectCallback = appState => {
	window.history.replaceState(
		{},
		document.title,
		appState && appState.targetUrl
			? appState.targetUrl
			: window.location.pathname
	);
};

ReactDOM.render(
	<Auth0Provider
		domain={process.env.REACT_APP_AUTH0_DOMAIN}
		client_id={process.env.REACT_APP_AUTH0_CLIENT_ID}
		redirect_uri={window.location.origin}
		onRedirectCallback={onRedirectCallback}
		audience={process.env.REACT_APP_AUTH0_AUDIENCE}
	>
		<App />
	</Auth0Provider>,
	document.getElementById("root")
);

serviceWorker.unregister();

