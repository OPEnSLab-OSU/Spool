/**
 * Created by eliwinkelman on 9/17/19.
 */

import React from 'react'
import {Form} from 'react-bootstrap'


function LayoutEditor(props) {

	let layout = props.layout;
	if (layout == undefined) {
		layout = {xaxis: {}, yaxis: {}}
	}
	if (layout.xaxis == undefined) {
		layout.xaxis = {}
	}
	if (layout.yaxis == undefined) {
		layout.yaxis = {}
	}

	console.log(layout);

	return (
		<>
			<Form.Group controlId="GraphForm.title">
				<Form.Label>Title</Form.Label>
				<Form.Control onChange={props.onChange} name='layout.title' value={layout.title}/>
			</Form.Group>
			<Form.Group controlId="GraphForm.xaxis">
				<Form.Label>X Axis Title</Form.Label>
				<Form.Control name="layout.xaxis.title" onChange={props.onChange} value={layout.xaxis.title} />
			</Form.Group>
			<Form.Group controlId="GraphForm.yaxis">
				<Form.Label>Y Axis Title</Form.Label>
				<Form.Control name="layout.yaxis.title" onChange={props.onChange} value={layout.yaxis.title} />
			</Form.Group>
		</>
	)
}

export default LayoutEditor;