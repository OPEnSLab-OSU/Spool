var React = require('react');
var DefaultLayout = require('./layouts/default');


class newDataRun extends React.Component {

	render() {
		return (
			<DefaultLayout title={this.props.title} locals={this.props.locals}>
				<div className="container-fluid">
					<div className="row">
						<div className="col-3"></div>
						<div className="col-6">
							<h1>New Data Run</h1>
							<form method="post" action="/u/device/view">
								<div className="form-group">
									<label htmlFor="name">Name</label>
									<input className="form-control" type="text" name="name"></input>
								</div>

								<button type="submit" className="btn btn-primary">Create data run</button>
							</form>
						</div>
					</div>
				</div>
			</DefaultLayout>
		)
	}
}

module.exports = newDataRun;