import React from 'react';

class Table extends React.Component {

	constructor(props){
		super(props);

	}

	getHeader (){
		var keys = this.getKeys();

	};

	render() {

		var items = this.props.data;

		var header = Array.from(items[0]).map(([key, value])=>{
			console.log(key);
			return <th key={key}>{key.toUpperCase()}</th>
		});

		var rowData = items.map((row, index)=>{
				return <tr key={index}><RenderRow key={index} data={row}/></tr>
			});



		return (
			<div>
				<table className="table table-sm table-hover">
					<thead>
					<tr>{header}</tr>
					</thead>
					<tbody>
					{rowData}
					</tbody>
				</table>
			</div>
		);
	}
}

class RenderRow extends React.Component {
	render() {
		return Array.from(this.props.data).map(([key, value]) => {
			return <td key={key}>{value}</td>
		})
	}
}

module.exports = Table;