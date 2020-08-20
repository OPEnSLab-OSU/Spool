import React from 'react';

function TableComponent(props) {
	console.log(props);
	var items = props.data;
	console.log(items);

	let header = Array.from(items[0]).map(([key, value])=>{
		console.log(key);
		return <th key={key}>{key.toUpperCase()}</th>
	});

	let rowData = items.map((row, index)=>{
		return <tr key={index}><RenderRow key={index} data={row}/></tr>
	});
	
	return <div className="pre-scrollable">
				<table className="table table-sm table-hover">
					<thead>
					<tr>{header}</tr>
					</thead>
					<tbody>
					{rowData}
					</tbody>
				</table>
			</div>


}

function RenderRow(props) {
		return Array.from(props.data).map(([key, value]) => {
			return <td key={key}>{value}</td>
		})
}

export default TableComponent;