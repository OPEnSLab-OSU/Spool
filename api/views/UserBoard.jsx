var React = require('react');
var DefaultLayout = require('./layouts/default');


class UserBoard extends React.Component {
	constructor(props) {
		super(props);

	}

	render() {

		if (this.props.format == "list") {
			const users = this.props.users.map((user, index) => {
				var link = "/u/user/" + user._id;
				return <div><UserRow name={user.name} email={user.email} key={index} index={index} link={link}/></div>
			});

			var userBoard =
				<div>
					<table className="table table-hover">
						<thead>
						<tr>
							<th scope="col">#</th>
							<th scope="col">Email</th>
							<th scope="col"></th>
						</tr>
						</thead>
						<tbody>
						{users}
						</tbody>
					</table>
				</div>;

		}
		else {
			var users = this.props.users.map((user, index) => {
				var link = "/u/user/" + user._id;
				return <div className="col" style={{paddingBottom: "10px"}}><UserPanel name={user.name} email={user.email} link={link}/></div>
			});

			var userBoard = <div className="container-fluid">
				<div className="row">
					{users}
				</div>
				
			</div>;

		}

		return (
			<div>
				{userBoard}
			</div>
		);

	}
}

class UserRow extends React.Component {
	render() {
		return (
			<tr>
				<th scope="row">{this.props.index}</th>
				<td>{this.props.email}</td>
				<td><a href={this.props.link} className="btn btn-primary">View</a></td>
			</tr>
		)
	}
}



class UserPanel extends  React.Component {
	render() {
		return (
			<div className="card">
				<div className="card-body">
					<h6 className="card-subtitle mb-2 text-muted">{this.props.email}</h6>
					<a href={this.props.link} className="btn btn-primary">View</a>
				</div>
			</div>
		)
	}
}

module.exports = UserBoard;