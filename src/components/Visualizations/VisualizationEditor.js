/**
 * Created by eliwinkelman on 9/12/19.
 */

import {Button, Modal, Form, Collapse, Card} from 'react-bootstrap'
import LayoutEditor from './LayoutEditor'
import {DataSourceOptions} from './VisualizationOptions';
import React, { useState } from 'react'

const capitalize = function(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

function VisualizationEditor(props) {

	let dataSourcesEditors = [];

	if (props.graphState.data !== undefined) {
		props.graphState.data.forEach((dataSource) => {dataSourcesEditors.push(<DataSourceEditor dataSource={dataSource} {...props}/>)})
	}

	return (
		<Modal show={props.show} onHide={props.handleClose} centered>
			<Modal.Body>
				<Form>
					<LayoutEditor onChange={props.onChange} layout={props.graphState.layout}/>
					{dataSourcesEditors}
					<Button onClick={props.addPlot}>Add Plot</Button>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="primary" onClick={props.handleSave}>
					Save
				</Button>
			</Modal.Footer>
		</Modal>
	)
}

function DataSourceEditor(props) {
	let dataSourceState = props.dataSource;
	let options = DataSourceOptions(props.dataSources, dataSourceState.type).options;
	
	return (
		<>
		<FormGroupFromOptions onChange={props.onChange} name={"data."+dataSourceState.index} formState={dataSourceState} options={options} formFooter={<Button variant="danger" onClick={props.deletePlot(dataSourceState.index)}>Delete</Button>}/>
		</>
	)
}

function FormGroupFromOptions(props) {
	let form = [];
	const [show, setShow] = useState(false);
	let name = props.name || '';
	let names = props.name.split('.');

	props.options.forEach(option => {
		// look at the type and handle as necessary
		let optionState = {};
		if (props.formState !== undefined) {
			optionState = props.formState[option.name] || {};
		}

		console.log(props.formState);

		let elementName = name !== '' ? [name, option.name].join('.') : option.name;
		switch(option.type) {
			case 'select': form.push(<SelectElement option={option} name={elementName} state={optionState} onChange={props.onChange}/>);
				break;
			case 'input': form.push(<InputElement option={option} name={elementName} state={optionState} onChange={props.onChange} />);
				break;
			case 'form': form.push(<FormGroupFromOptions name={elementName} options={option.options} formState={optionState} onChange={props.onChange}/>);
				break;
			default:
		}
	});

	return (
		<Card>
			<Card.Header onClick={() => setShow(!show)} aria-controls="showForm" aria-expanded={show}>
				{capitalize(names[names.length-1])}
			</Card.Header>
			<Collapse in={show}>
					<div id="showForm">
						<Card.Body>
						{form}
				</Card.Body>
						{props.formFooter !== undefined &&
						<Card.Footer>
							{props.formFooter}
						</Card.Footer>}
					</div>


			</Collapse>
		</Card>
	)
}

function InputElement(props) {
	let option = props.option;

	return (
		<Form.Group controlId="GraphForm.title">
			<Form.Label>{capitalize(option.name)}</Form.Label>
			<Form.Control name={props.name} onChange={props.onChange} value={props.state}/>
		</Form.Group>
	)
}


function SelectElement(props){
	let option = props.option;

	return (
		<Form.Group controlId={option.name}>
			<Form.Label>{capitalize(option.name)}</Form.Label>
			<Form.Control as="select" name={props.name} onChange={props.onChange} value={props.state}>
				{option.options.map((value, index)=> {return <option>{value}</option>})}
			</Form.Control>
		</Form.Group>
	)
}


export default VisualizationEditor;