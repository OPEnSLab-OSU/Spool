var React = require('react');
var EditForm = require('./components/editForm');
var DefaultLayout = require('./layouts/default');


class EditUserForm extends React.Component {
	constructor(props) {
		super(props);
		
		/*
		this.props.user = {
		user object from db minus things that are security sensitive
		}
		 */
	}

	render() {
		return (
			<DefaultLayout title="Edit User" locals={this.prop.locals}>
				<div className="container-fluid">
					<div className="row">
						<div className="col-3"></div>
						<div className="col-6">
							<form method="post" action={this.props.url}>
								<div className="form-group">
									<label htmlFor="username">Username</label>
									<input className="form-control" type="text" name="username" defaultValue={this.props.user._json.nickname}/>
								</div>

								<div className="form-group">
									<label htmlFor="email">Email</label>
									<input className="form-control" type="text" name="email" defaultValue={this.props.user._json.email}/>
								</div>
								
								<button type="submit" className="btn btn-primary">Submit</button>
							</form>
						</div>
					</div>
				</div>
			</DefaultLayout>
		);
	}
}

module.exports = EditUserForm;