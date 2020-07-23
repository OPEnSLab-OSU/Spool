/**
 * Created by eliwinkelman on 9/12/19.
 */

import React, {useState, useEffect} from 'react'
import {useAuth0} from '../../react-auth0-wrapper'
import Visualization from './Visualization'
import { getVisualizations, newVisualization } from '../../api'

import { Col, Container, CardDeck, Row, Button } from 'react-bootstrap'

function VisualizationDashboard(props) {

	const [showResult, setShowResult] = useState(false);
	const [visualizationApi, setVisualizationApi] = useState([]);
	const [dataSources, setDataSources] = useState([]);
	const {getTokenSilently} = useAuth0();

	async function fetchData() {
		getVisualizations(props.device_id, getTokenSilently, (visualizations) => {
			if (visualizations !== undefined) {
				setVisualizationApi(visualizations);
				setDataSources(Array.from(props.deviceData[0]).map(([key, value])=>{
					return key;
				}));

				setShowResult(true);
			}
		});
	}

	useEffect(() => {
		fetchData();
	});
	

	const handleNewVisualization = () => {
		
			if (dataSources.length < 2) {
				alert("Cannot create data visualizations without at least two data sources.");
			}

			let visualization =  {
				name: "New Visualization",
				device_id: props.device_id,
				graph: {
					xLabel: undefined,
					yLabel: undefined
				}
			};

			newVisualization(visualization, getTokenSilently, (status) => {
				if (status === 200){
					fetchData();
				}
			})

	};

	const visualizationDisplay = (visualizations) => {
		return visualizations.map((visualization, index) => {
			return (
					<Visualization visualizationData={visualization} onDelete={fetchData} deviceData={props.deviceData} dataSources={dataSources}/>
			)
		});
	};

	return (
		<>
		<CardDeck>
			{showResult && visualizationDisplay(visualizationApi)}
		</CardDeck>
		<Container fluid={true}>
			<Row>
				<Col>
					<Button variant="primary" onClick={handleNewVisualization}>New Visualization</Button>
				</Col>
			</Row>
		</Container>
		</>
	);
}

export default VisualizationDashboard;