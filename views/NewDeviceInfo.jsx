var React = require('react');
var DefaultLayout = require('./layouts/default');

class RegisterDeviceForm extends React.Component {
	render() {
		var url = 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.props.device_info);
		var downloadbutton = <a class="btn btn-primary" href={url} download="loom_configuration.json">Download</a>;

		return (
		
			<DefaultLayout title="Register Device" locals={this.props.locals}>
				<div className="container-fluid">
					<div className="row">
						<div className="col-3"></div>
						<div className="col-6">
							<h1>New Device Info</h1>
							<p>Include this in your loom config</p>
							<code className="text-break">
								{this.props.device_info}
							</code>
							<br />
							{downloadbutton}
						</div>
					</div>
				</div>
			</DefaultLayout>
		);
	}
}

module.exports = RegisterDeviceForm;