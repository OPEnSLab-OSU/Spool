/**
 * Created by eliwinkelman on 9/11/19.
 */


import React, { useState, useEffect } from 'react'
import VisualizationEditor from './VisualizationEditor';
import Plot from 'react-plotly.js';
import {Card, Button, Modal, Form} from 'react-bootstrap';
import {updateVisualization, deleteVisualization} from '../../api';
import {useAuth0} from '../../react-auth0-wrapper'

//create your forceUpdate hook
function useForceUpdate(){
	const [value, set] = useState(true); //boolean state
	return () => set(value => !value); // toggle the state to force render
}

function Visualization(props) {

	/**
	 * You must have at least two data sources to use this graph component! TODO: check for this somewhere
	 *
	 * props:
	 * deviceData: all the data points from the device
	 * visualizationData:
	 *  name: string
	 *  owner: uuid
	 *  xLabel: string
	 *  yLabel: string
	 *  ...
	 */

	const [graphState, setGraphState] = useState(props.visualizationData.graph);
	let updateStateForSize = true;
	const [updateStateForSizeCounter, setUpdateStateForSizeCounter] = useState(-1);
	const forceUpdate = useForceUpdate();

	const [showEditModal, setShowEditModal] = useState(false);
	const {getTokenSilently} = useAuth0();

	const handleClose = () => setShowEditModal(false);
	const handleShow = () => setShowEditModal(true);
	const handleSave = (event) => {
		let visualizationData = props.visualizationData;
		visualizationData.graph = graphState;

		updateVisualization(visualizationData, getTokenSilently, () => {
			handleClose();
		})
	};

	const handleDelete = () => {
		deleteVisualization(props.visualizationData, getTokenSilently, (status) => {
			if (status = 200) {
				props.onDelete();
			}
		})
	};

	/*useEffect(() => {
		const height = document.getElementById(props.visualizationData.visualization_id).clientHeight;

		if (height != 0) {
			if (updateStateForSizeCounter > 5) {
				updateStateForSize = false;
			}
			if (updateStateForSize == true) {
				setUpdateStateForSizeCounter(updateStateForSizeCounter+1);
			}
		}
		else {
			setUpdateStateForSizeCounter(-updateStateForSizeCounter)
		}
	}, [updateStateForSizeCounter]);*/

	const handleInputChange = (event) => {

		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;
		console.log(name);
		let currentGraphState = graphState;
		currentGraphState = unpackNestedName(currentGraphState, name, value);

		setGraphState(currentGraphState);
		console.log(graphState);
		forceUpdate();
	};

	const addPlot = () => {
		if (graphState.data != undefined) {
			let tempGraphState = graphState;
			tempGraphState.data.push({index: graphState.data.length, type: 'scatter'});
			setGraphState(tempGraphState);
		}
		else {
			let tempGraphState = graphState;
			tempGraphState.data = [{index: 0, type: 'scatter'}];
			setGraphState(tempGraphState);
		}
		console.log(graphState.data);
		forceUpdate();
	};

	const deletePlot = (index) => {
		return () => {
			let tempGraphState = graphState;
			tempGraphState.data.splice(index, 1);
			console.log("deleted");
			tempGraphState.data.forEach((data, index) => {
				console.log(index);
				console.log(data);
				
				tempGraphState.data[index].index = index;
			});

			setGraphState(tempGraphState);
			forceUpdate();
		}
	};
	
	console.log(graphState);

	let data;
	data = createDataPlots(graphState.data, props.deviceData);

	return (
		<>
		<Card id={props.visualizationData.visualization_id} style={{minWidth: '300px', minHeight: '300px', maxWidth: '40vw'}}>
			<Card.Body style={{maxHeight: '50vh', maxWidth: '50vw'}}>
				{React.createElement(Plot, {data: data, layout: getLayout(graphState), useResizeHandler: true, style: {width: "100%", height: "100%"}})}
			</Card.Body>
			<Card.Footer>
				<Button variant="primary" onClick={handleShow} size="sm">Edit</Button>
				<Button variant="danger" onClick={handleDelete} size="sm">Delete</Button>
			</Card.Footer>
		</Card>
		<VisualizationEditor dataSources={props.dataSources} addPlot={addPlot} deletePlot={deletePlot} handleSave={handleSave} show={showEditModal} handleShow={handleShow} handleClose={handleClose} onChange={handleInputChange} graphState={graphState}/>
		</>
	)
}

function getLayout(graphState) {

	let layout = graphState.layout != undefined ? JSON.parse(JSON.stringify(graphState.layout)) : {};
	layout.autosize = true;
	layout.margin = {l: 40, r: 0, b: 40, t: 40, pad: 0};
	return layout;
}

function createDataPlots(datas, deviceData) {

	let plots = [];

	if (datas != undefined) {
		datas.forEach((data) => {
			if (data != undefined) {
				plots.push(createOneDataPlot(data, deviceData))
			}
		})
	}

	return plots;
}

function createOneDataPlot(data, deviceData) {
	/*
	dataSources is an array of objects that look like [{name: string, label: string}]
	 */

	let plot = {};

	if (data.data != undefined){
		for (const key of Object.keys(data.data)) {
			plot[key] = getGraphData(deviceData, data.data[key])
		}
	}

	for (const key of Object.keys(data)) {
		if (key != "data") {
			plot[key] = data[key];
		}
	}

	return plot;
}

function unpackNestedName(parentObject, name, value) {
	
	let names = name.split(".");
	if (names.length == 1) {
		// we are as nested as possible, set the value.
		parentObject[name] = value;
	}
	else {
		// we aren't nested enough

		let currentObjectName = names.shift();
		let nextObjectName = names.shift();
		let nextObject;

		if (!isNaN(nextObjectName)) {
			// current object is actually an array, need to treat it as such.

			if (parentObject[currentObjectName] == undefined) {
				parentObject[currentObjectName] = [];
			}
			if (parentObject[currentObjectName][parseInt(nextObjectName)] == undefined) {
				parentObject[currentObjectName][parseInt(nextObjectName)] = {}
			}
			nextObject = parentObject[currentObjectName][parseInt(nextObjectName)];
			console.log(nextObject);
		}

		else {
			
			names.unshift(nextObjectName);

			if (parentObject[currentObjectName] == undefined) {
				parentObject[currentObjectName] = {};
			}
			nextObject = parentObject[currentObjectName];
		}
		let name = names.join(".");
		unpackNestedName(nextObject, name, value)
	}
	
	return parentObject;
}

function getGraphData(deviceData, dataLabel) {
	let datas = deviceData.map((data, index) => {
		return data.get(dataLabel)
	});

	return datas;
}

export default Visualization;
