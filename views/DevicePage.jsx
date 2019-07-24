var React = require('react');
var DefaultLayout = require('./layouts/default');
var Table = require('./components/table');

class DevicePage extends React.Component {
	//this needs to be passed props.device and props.data where device is the device and data is an array of the data the device has collected sorted by timestamp.
	// also pass props.users which is an array of users with access to the device
	render() {

		/*
		const users = this.props.users.map((user, index) => {
			var link = "/u/user/" + user._id;
			return <UserRow name={user.name} email={user.email} key={index} index={index} link={link}/>
		});

		var userBoard =
			<div>
				<table className="table table-hover">
					<thead>
					<tr>
						<th scope="col">#</th>
						<th scope="col">Email</th>
						<th scope="col"></th>
					</tr>
					</thead>
					<tbody>
					{users}
					
					</tbody>
				</table>
			</div>;*/

		/*
		console.log("hello");
		const datas = this.props.data.map((data, index) => {
			return <DataRow data = {this.props.data} />
		});

		var headers = [];
		console.log(datas);
		for (key in this.props.data) {

			if (this.props.data.hasOwnProperty(key)) {
				headers.push(<th>{key}</th>)
			}
		}
		console.log(headers);
		var dataList =
			<div>
				<table className="table table-sm table-hover">
				<thead>
				<tr>
					{headers}
				</tr>
				</thead>
				<tbody>
					{datas}
				</tbody>
				</table>
			</div>;
*/
		return (
			<DefaultLayout title="Device" locals={this.props.locals}>
				<div className="container-fluid">
					<div className="row">
						<div className="col">
							<h3>Name: {this.props.device.name} </h3>
							<h4>Type: {this.props.device.type} </h4>
						</div>
					</div>

						<Table data={this.props.data}/>

				</div>
			</DefaultLayout>
		)
	}
}
/*
class DataRow extends React.Component {

	render() {

		var cols = [];

		for (key in this.props.data) {

			if (this.props.data.hasOwnProperty(key)) {
				cols.push(<td>{this.props.data[key]}</td>)
			}
		}
		console.log(cols);

		return (
			<tr>
				{cols}
			</tr>
		)
	}
}*/
module.exports = DevicePage;
