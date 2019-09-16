/**
 * Created by eliwinkelman on 9/11/19.
 */


import React, { useState, useEffect } from 'react'
import VisualizationEditor from './VisualizationEditor';
import Plot from 'react-plotly.js';
import {Card, Button, Modal, Form} from 'react-bootstrap';
import {updateVisualization, deleteVisualization} from '../../api';
import {useAuth0} from '../../react-auth0-wrapper'

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

	const [xLabel, setXLabel] = useState(props.visualizationData.graph.xLabel);
	const [yLabel, setYLabel] = useState(props.visualizationData.graph.yLabel);
	let updateStateForSize = true;
	const [updateStateForSizeCounter, setUpdateStateForSizeCounter] = useState(0);

	const [showEditModal, setShowEditModal] = useState(false);
	const {getTokenSilently} = useAuth0();


	const handleClose = () => setShowEditModal(false);
	const handleShow = () => setShowEditModal(true);
	const handleSave = (event) => {
		let visualizationData = props.visualizationData;
		visualizationData.graph.xLabel = xLabel;
		visualizationData.graph.yLabel = yLabel;

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

	useEffect(() => {
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
			setUpdateStateForSizeCounter(updateStateForSizeCounter-1)
		}
	});

	const changeXLabel = (event) => {
		event.preventDefault();
		setXLabel(event.target.value);
	};

	const changeYLabel = (event) => {
		event.preventDefault();
		setYLabel(event.target.value);
	};

	let xData = getGraphData(props.deviceData, xLabel);

	let yData = getGraphData(props.deviceData, yLabel);

	let data =
		[{
			x: xData,
			y: yData,
			type: props.type || 'line',
			mode: props.mode || 'lines+points',
			marker: props.marker || {color: 'red'}
		}];

	return (
		<>
		<Card id={props.visualizationData.visualization_id} style={{minWidth: '300px', minHeight: '300px', maxHeight: '10vh', maxWidth: '50vw'}}>
			<Card.Body style={{maxHeight: '50vh'}}>
				{React.createElement(Plot, {data: data, layout: {autosize: true, margin: {l: 20, r: 0, b: 20, t: 0, pad: 0}}, useResizeHandler: true, style: {width: "100%", height: "100%"}})}
			</Card.Body>
			<Card.Footer>
				<Button variant="primary" onClick={handleShow} size="sm">Edit</Button>
				<Button variant="danger" onClick={handleDelete} size="sm">Delete</Button>
			</Card.Footer>
		</Card>
		<VisualizationEditor dataSources={props.dataSources} handleSave={handleSave} show={showEditModal} handleShow={handleShow} handleClose={handleClose} changeXLabel={changeXLabel} changeYLabel={changeYLabel} xLabel={props.visualizationData.xLabel} yLabel={props.visualizationData.yLabel}/>
		</>
	)
}

function getGraphData(deviceData, dataLabel) {
	let datas = deviceData.map((data, index) => {
		return data.get(dataLabel)
	});

	return datas;
}

export default Visualization;
