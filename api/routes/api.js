/**
 * Defines the schema for each api endpoint to ensure that the API is consistent.
 * @module ApiSchemas
 */

const RegisterDeviceSchema = {
	type: 'object',
	required: ['name'],
	properties: {
		name: {
			type: 'string'
		}
	}
};

const GetUsersDevicesSchema = {
	type: 'object',
	required: ['user_id'],
	properties: {
		user_id: {
			type: 'string'
		}
	}
};

const GetDeviceDataSchema = {
	type: 'object',
	required: ['device_id'],
	properties: {
		device_id: {
			type: 'string'
		},
		data_run: {
			type: 'string'
		}
	}
};

const PostDeviceDataSchema = {
	type: 'object',
	required: ['device_id', 'data', 'data_run'],
	properties: {
		device_id: {
			type: 'string'
		},
		data_run: {
			type: 'string'
		},
		data: {
			type: 'object'
		}
	}
};

const NewVisualizationSchema = {
	type: 'object',
	required: ['name', 'device_id', 'xLabel', 'yLabel'],
	properties: {
		name: {
			type: 'string'
		},
		device_id:{
			type: 'string'
		},
		xLabel: {
			type: 'string'
		},
		yLabel: {
			type: 'stirng'
		}
	}
};

module.exports = {
	RegisterDeviceSchema: RegisterDeviceSchema,
	PostDeviceDataSchema: PostDeviceDataSchema,
	GetUsersDeviceDataSchema: GetDeviceDataSchema,
	NewVisualizationSchema: NewVisualizationSchema
};