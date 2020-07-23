/**
 * Created by eliwinkelman on 9/6/19.
 */

import React from 'react'
import TableComponent from './Table'

function DeviceDataTable(props){
	if (props.data.length !== 0) {

		return <TableComponent data={props.data}/>;
	}
	else {
		return <h5>This device has not reported any data yet.</h5>
	}
}

export default DeviceDataTable;