var React = require('react');
var DefaultLayout = require('./layouts/default');
var DeviceBoard = require('./DeviceBoard');
var UserBoard = require('./UserBoard');
class AdminDashboard extends React.Component {
	constructor(props) {
		super(props);

	}

	render() {
		
		if (this.props.activeTab == 'devices') {
			var board = <DeviceBoard devices={this.props.devices} format="cards"/>
		}
		else {
			var board = <UserBoard users={this.props.users} format="list"/>
		}

		return (
			<DefaultLayout title="Admin" locals={this.props.locals}>
				<AdminDashboardNav activeTab={this.props.activeTab}/>
				{board}
			</DefaultLayout>
		);
	}
}

class AdminDashboardNav extends React.Component {
	//this should be passed a prop called "activeTab"

	render() {

		if (this.props.activeTab == 'devices') {
			var deviceButton = <a className="nav-link active" href="#">Devices</a>;
			var userButton = <a className="nav-link" href="/u?tab=users">Users</a>
		}
		else {
			var deviceButton = <a className="nav-link" href="/u?tab=devices">Devices</a>;
			var userButton = <a className="nav-link active" href="#">Users</a>
		}

		return (
			<ul class="nav nav-tabs">
				<li class="nav-item">
					{deviceButton}
				</li>
				<li class="nav-item">
					{userButton}
				</li>
			</ul>
		)
	}
}

module.exports = AdminDashboard;