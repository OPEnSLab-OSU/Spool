var React = require('react');
var DefaultLayout = require('./layouts/default');
var DeviceBoard = require('./DeviceBoard');
class UserDashboard extends React.Component {
	constructor(props) {
		super(props);

	}

	render() {

		return (
			<DefaultLayout title="Dashboard" locals={this.props.locals}>
				<DeviceBoard format="cards" devices={this.props.devices}/>
			</DefaultLayout>
		);
	}
}

module.exports = UserDashboard;