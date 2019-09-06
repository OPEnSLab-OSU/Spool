/**
 * Created by eliwinkelman on 9/6/19.
 */

import React from 'react'
var Table = require('table');

function DeviceDataTable(props){
	var table;
	if (props.data.length !== 0) {
		table = <Table data={props.data}/>
	}
	else {
		table = <h5>This device has not reported any data yet.</h5>
	}
	return (table);
};

export default DeviceDataTable;