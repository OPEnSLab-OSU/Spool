var React = require('react');
var DefaultLayout = require('./layouts/default');
class UserDashboard extends React.Component {
	constructor(props) {
		super(props);

	}

	render() {
		const devices = this.props.devices.map((device, index) => {
			var link = "/u/device/" + device.device_id;
			return <div className="col" style={{paddingBottom: "10px"}}><DevicePanel name={device.name} type={device.type} link={link}/></div>
		});

		return (
			<DefaultLayout title="Dashboard" locals={this.props.locals}>
				<div className="container-fluid">

					<div className="row">
						{devices}
					</div>

					<div className = "row">
						<div class="col">
						<a href="/u/device/register" className="btn btn-lg btn-primary">Register New Device</a>
						</div>
					</div>
				</div>
			</DefaultLayout>
		);
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

module.exports = UserDashboard;