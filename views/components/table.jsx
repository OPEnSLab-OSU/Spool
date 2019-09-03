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
		
		//var keys = Object.keys(this.props.data[0]);
		var keys = this.props.data[0].map((key, index) => {
			return key
		});
		console.log(keys);
		var header = keys.map((key, index)=>{
			console.log(key);
			return <th key={key}>{key.toUpperCase()}</th>
		});

		var rowData = items.map((row, index)=>{
				return <tr key={index}><RenderRow key={index} data={row} keys={keys}/></tr>
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
		return this.props.keys.map((key, index)=>{
			return <td key={this.props.data[key]}>{this.props.data[key]}</td>
		})
	}

}

module.exports = Table;