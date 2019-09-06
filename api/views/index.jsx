var React = require('react');
var DefaultLayout = require('./layouts/default');

class HelloMessage extends React.Component {

	render() {
		return (
			<DefaultLayout title={this.props.title} locals={this.props.locals}>
				<div className="container-fluid">
					<div className="row">
						<div className="col text-center">
							<h1>Welcome to Spool</h1>
							<h3></h3>
						</div>
					</div>
				</div>
			</DefaultLayout>
		);
	}
}

module.exports = HelloMessage;