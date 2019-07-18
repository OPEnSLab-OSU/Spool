var React = require('react');
var DefaultLayout = require('./layouts/default');

class Error extends React.Component {

	render() {
		return (
			<DefaultLayout title="Error" locals={{user: null}}>
				<h3>{this.props.error.status} - {this.props.error.message}</h3>
				<p>{this.props.error.stack}</p>
			</DefaultLayout>
		);
	}
}

module.exports = Error;