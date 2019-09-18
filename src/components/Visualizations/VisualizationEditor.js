/**
 * Created by eliwinkelman on 9/12/19.
 */

import {Button, Modal, Form, Collapse, Card} from 'react-bootstrap'
import LayoutEditor from './LayoutEditor'
import {DataSourceOptions} from './VisualizationOptions';
import React, { useState, useEffect } from 'react'

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

function VisualizationEditor(props) {

	let dataSourcesEditors = [];

	if (props.graphState.data != undefined) {
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
		<FormGroupFromOptions onChange={props.onChange} name={"data."+dataSourceState.index} options={options} formFooter={<Button variant="danger" onClick={props.deletePlot(dataSourceState.index)}>Delete</Button>}/>
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
		let elementName = name != '' ? [name, option.name].join('.') : option.name;
		switch(option.type) {
			case 'select': form.push(<SelectElement option={option} name={elementName} onChange={props.onChange}/>);
				break;
			case 'form': form.push(<FormGroupFromOptions name={elementName} options={option.options} onChange={props.onChange}/>);
		}
	});

	return (
		<Card>
			<Card.Header onClick={() => setShow(!show)} aria-controls="showForm" aria-expanded={show}>
				{names[names.length-1].capitalize()}
			</Card.Header>
			<Collapse in={show}>
					<div id="showForm">
						<Card.Body>
						{form}
				</Card.Body>
						{props.formFooter != undefined &&
						<Card.Footer>
							{props.formFooter}
						</Card.Footer>}
					</div>


			</Collapse>
		</Card>
	)
}

function SelectElement(props){
	let option = props.option;

	return (
		<Form.Group controlId={option.name}>
			<Form.Label>{option.name.capitalize()}</Form.Label>
			<Form.Control as="select" name={props.name} onChange={props.onChange}>
				{option.options.map((value, index)=> {return <option>{value}</option>})}
			</Form.Control>
		</Form.Group>
	)
}


export default VisualizationEditor;