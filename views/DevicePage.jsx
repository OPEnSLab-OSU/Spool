var React = require('react');
var DefaultLayout = require('./layouts/default');
var Table = require('./components/table');

class DevicePage extends React.Component {
	//this needs to be passed props.device and props.data where device is the device and data is an array of the data the device has collected sorted by timestamp.
	// also pass props.users which is an array of users with access to the device
	render() {

		// eventually we should display which users are attached to a device
		
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
		
		// if there is data, display it in tabular format, otherwise don't display it
		
		var table;
		
		if (this.props.data.length != 0) {
			table = <Table data={this.props.data}/>
		}
		else {
			table = <h5>This device has not reported any data yet.</h5>
		}

		return (
			<DefaultLayout title="Device" locals={this.props.locals}>
				<div className="container-fluid">
					<div className="row">
						<div className="col">
							<h3>Name: {this.props.device.name} </h3>
							<h4>Type: {this.props.device.type} </h4>
							<a href={'/u/device/delete/' + this.props.device.device_id} className="btn btn-danger">Delete</a>
						</div>
					</div>
					{table}
				</div>
			</DefaultLayout>
		)
	}
}

module.exports = DevicePage;
