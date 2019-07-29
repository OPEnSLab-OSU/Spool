var React = require('react');
var DefaultLayout = require('./layouts/default');

class RegisterDeviceForm extends React.Component {
	render() {
		const devicetypes = ['eGreenhouse', 'SapFlow'];
		return (

				<DefaultLayout title="Register Device" locals={this.props.locals}>
					<div className="container-fluid">
						<div className="row">
							<div className="col-3"></div>
							<div className="col-6">
								<h1>Register Device</h1>
								<form method="post" action="/u/device/register">
									<div className="form-group">
										<label htmlFor="name">Device Name</label>
										<input className="form-control" type="text" name="name"></input>
									</div>

									<div className="form-group">
										<label htmlFor="type">Device Type</label>
										<select className="form-control" name="type">
										{devicetypes.map((value, index ) => {
											return <option key={index}>{value}</option>
										})}
										</select>
									</div>

									<button type="submit" className="btn btn-primary">Download Configuration</button>
								</form>
							</div>
						</div>
					</div>

			</DefaultLayout>
		);
	}
}

module.exports = RegisterDeviceForm;