var React = require('react');

class AnalysisView extends  React.Component {
	render() {
		var data = [this.props.analysis.data];
		return (
			<div>
			<script>
				Plotly.newPlot({this.props.analysis.name}, {data}, {{}});
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