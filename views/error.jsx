var React = require('react');
var DefaultLayout = require('./layouts/default');

class Error extends React.Component {

	render() {
		return (
			<DefaultLayout title={this.props.title}>
				<div>Hello {this.props.name}</div>
			</DefaultLayout>
		);
	}
}

module.exports = Error;