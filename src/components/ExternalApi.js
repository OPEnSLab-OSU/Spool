/**
 * Created by eliwinkelman on 9/4/19.
 */
// src/components/ExternalApi.js

import React, { useState } from "react";
import { useAuth0 } from "../react-auth0-wrapper";

const ExternalApi = () => {
	const [showResult, setShowResult] = useState(false);
	const [apiMessage, setApiMessage] = useState("");
	const { getTokenSilently, user } = useAuth0();

	const callApi = async () => {
		try {
			const token = await getTokenSilently();

			console.log(user);

			const response = await fetch("/access/devices/", {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			const responseData = await response.json();

			setShowResult(true);
			setApiMessage(responseData);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
		<h1>External API</h1>
		<button onClick={callApi}>Ping API</button>
		{showResult && <code>{JSON.stringify(apiMessage, null, 2)}</code>}
		</>
	);
};

export default ExternalApi;