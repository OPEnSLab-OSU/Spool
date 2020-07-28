/**
 * Created by eliwinkelman on 9/17/19.
 */

export const HistogramOptions = (dataLabels) => {
	
	return {
		options: [{name: 'data', type: 'form', options: [
			{name: 'x', type: 'select', options: dataLabels}
		]}]
	}
};

export const ScatterOptions = (dataLabels) => {
	return {
		options: [
			{name: 'mode',
				type: 'select',
				options: ['lines', 'markers', 'lines+markers']},
			{name: 'data', type: 'form', options: [
				{name: 'x', type: 'select', options: dataLabels},
				{name: 'y', type: 'select', options: dataLabels}
			]},
			{name: 'marker', type: 'form', options: [
				{name: 'color', type: 'select', options: ['red', 'blue', 'green']}
			]}
		]
	}
};

export const DataSourceOptions = (dataLabels, currentType) => {

	const types = ['scatter', 'histogram'];
	const typeOptionMap = {'scatter': ScatterOptions(dataLabels), 'histogram': HistogramOptions(dataLabels)};
	
	let options = [
		{name: 'type', type: 'select', options: types},
		{name: 'name', type: 'input'}
	];

	options = options.concat(typeOptionMap[currentType].options);

	return {
		options: options
	}
};
