var React = require('react');

class EditForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.props;

		this.createForm = this.createForm.bind(this);
		console.log("edit Form constructor");
		/*
		props looks like
		{
			url: <url to post submit to>
			form: [
				{name: string, value: string},
		        {name: string, value: string},
		        {name: string, value: string}
			]
		}
		 */
	};

	createForm() {
		let form = [];

		this.props.form.forEach(function(formInput, index) {
			form.push(<FormText name={formInput.name} value={formInput.value} key={index}/>);
		});

		console.log(form);
		return form
	};

	render() {
		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-3"></div>
					<div className="col-6">
						<form method="post" action={this.props.url}>
							{this.createForm()}
							<button type="submit" className="btn btn-primary">Submit</button>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

class FormText extends React.Component {
	constructor(props) {
		super(props);

		/*
		props look like
		{
			name: string
			value: string
		}
		 */
	}

	render() {
		return (
			<div className="form-group">
				<label htmlFor={this.props.name}>{this.props.name}</label>
				<input className="form-control" type="text" name={this.props.name} defaultValue={this.props.value}/>
			</div>
		)
	}
}
module.exports = EditForm;