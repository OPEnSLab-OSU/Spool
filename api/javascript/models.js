/**
 * Created by eliwinkelman on 9/12/19.
 */


class DeviceModel {
	constructor(name, device_id, fingerprint, owner) {
		this.name = name;
		this.device_id = device_id;
		this.fingerprint = fingerprint;
		this.owner = owner;
	}
}

class VisualizationModel {
	constructor(visualizationData) {
		this.name = visualizationData.name;
		this.device_id = visualizationData.device_id;
		this.visualization_id = visualizationData.visualization_id;
		this.owner = visualizationData.owner;
		this.graph = visualizationData.graph;
	}
}

class GraphModel {
	constructor(xLabel, yLabel) {
		this.xLabel = xLabel;
		this.yLabel = yLabel;
	}
}

module.exports = {
	GraphModel : GraphModel,
	DeviceModel: DeviceModel,
	VisualizationModel: VisualizationModel
};