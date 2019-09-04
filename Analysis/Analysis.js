/**
 * Created by eliwinkelman on 9/4/19.
 */

const analysisSchema = {
	dataSources: {}

};

class AnalysisManager {
	/***
	 *
	 * @param datas
	 * @param dataPipeline
	 * @param visualization
	 */
	constructor(name, data, dataPipeline, layout){
		this.name = name;
		this.data = data;
		this.layout = layout;
	};
}


module.exports = AnalysisManager;