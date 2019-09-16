/**
 * Created by eliwinkelman on 9/12/19.
 */

import React from 'react';
import {Button, Modal, Form} from 'react-bootstrap'


function VisualizationEditor(props) {
	return (
		<Modal show={props.show} onHide={props.handleClose} centered>
			<Modal.Body>
				<Form>
					<Form.Group controlId="GraphForm.xLabel">
						<Form.Label>X Axis</Form.Label>
						<Form.Control as="select" onChange={props.changeXLabel} value={props.xLabel}>
							{props.dataSources.map((value, index)=> {return <option>{value}</option>})}
						</Form.Control>
					</Form.Group>
					<Form.Group controlId="GraphForm.yLabel">
						<Form.Label>Y Axis</Form.Label>
						<Form.Control as="select" onChange={props.changeYLabel} value={props.yLabel}>
							{props.dataSources.map((value, index)=> {return <option>{value}</option>})}
						</Form.Control>
					</Form.Group>
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

export default VisualizationEditor;