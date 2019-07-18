var React = require('react');

class DefaultLayout extends React.Component {
	render() {
		return (
			<html>
			<head>
				<link rel="stylesheet" href="/css/bootstrap.min.css" />
				<title>{this.props.title}</title></head>
				<body>
					<NavBar locals={this.props.locals}/>
					{this.props.children}
				</body>
			</html>
		);
	}
}

class NavBar extends React.Component {

	render() {

		let logInOutButton;

		if (this.props.locals.user) {
			logInOutButton = <a className="nav-link" href="/auth/logout">Log Out</a>
		}else {
			logInOutButton = <a className="nav-link" href="/auth/login">Log In</a>
		}


		return (
			<div className="navbar navbar-expand">
				<div className="collapse navbar-collapse" id="navbarSupportedContent">
					<ul className="navbar-nav ml-auto">
						<li className="nav-item">
							<a className="nav-link" href="/u/">Dashboard<span class="sr-only">(current)</span></a>
						</li>
						<li className="nav-item">
							{logInOutButton}
						</li>
					</ul>
				</div>
			</div>
		)
	}
}
module.exports = DefaultLayout;