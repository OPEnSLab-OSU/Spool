var React = require('react');
var DefaultLayout = require('./layouts/default');

class AnalysisView extends  React.Component {
	render() {
		return (
			<div>
			<script>
				Plotly.newPlot(this.props.analysis.name, this.props.analysis.data, this.props.analysis.layout);
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