var React = require('react');
var DefaultLayout = require('./layouts/default');

class DeviceBoard extends React.Component {
	constructor(props) {
		super(props);

	}

	render() {

		if (this.props.format == "list") {
			const devices = this.props.devices.map((device, index) => {
				var link = "/u/device/" + device.device_id;
				return <div><DeviceRow name={device.name} type={device.type} key={index} index={index} link={link}/></div>
			});

			var deviceBoard =
				<div>
					<table className="table table-hover">
					<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col">Name</th>
							<th scope="col">Type</th>
							<th scope="col"></th>
						</tr>
					</thead>
					<tbody>
						{devices}
					</tbody>
					</table>
				</div>;
			
		}
		else {
			var devices = this.props.devices.map((device, index) => {
				var link = "/u/device/" + device.device_id;
				return <div className="col" style={{paddingBottom: "10px"}}><DevicePanel name={device.name} type={device.type} link={link}/></div>
			});

			var deviceBoard = <div className="container-fluid">
				<div className="row">
					{devices}
				</div>

				<div className = "row">
					<div className="col">
						<a href="/u/device/register" className="btn btn-lg btn-primary">Register New Device</a>
					</div>
				</div>
			</div>;

		}

		return (
			<div>
				{deviceBoard}
			</div>
		);

	}
}

class DeviceRow extends React.Component {

	render() {
		return (

			<tr>
				<th scope="row">{this.props.index}</th>
				<td>{this.props.name}</td>
				<td>{this.props.type}</td>
				<td><a href={this.props.link} className="btn btn-primary">View</a></td>
			</tr>

		)
	}
}

class DevicePanel extends  React.Component {
	render() {
		return (

			<div className="card">
				<div className="card-body">
					<h5 className="card-title">{this.props.name}</h5>
					<h6 className="card-subtitle mb-2 text-muted">{this.props.type}</h6>
					<a href={this.props.link} className="btn btn-primary">View</a>
				</div>
			</div>
		)
	}
}

module.exports = DeviceBoard;