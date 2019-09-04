var React = require('react');

class AnalysisView extends  React.Component {
	render() {
		return (
			<div>
			<script>
				Plotly.newPlot({this.props.analysis.name}, {JSON.stringify(this.props.analysis.data)}, {JSON.stringify(this.props.analysis.layout)});
			</script>
			<div className="card">
				<div className="card-body" id={this.props.analysis.name}>

				</div>
			</div>
			</div>
		)
	}
}
module.exports = AnalysisView;