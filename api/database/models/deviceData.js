/**
 * Created by eliwinkelman on 9/20/19.
 */

const { DatabaseInterface } = require("../db") ;
const DeviceDatabase = require("./device");
const { strMapToObj } = require("../../utils/utils");

/**
 * Manages the database storage for DeviceData objects.
 * @class
 * @implements DatabaseInterface
 */
class DeviceDataDatabase extends DatabaseInterface {

	/**
	 * Helper function to get the collection of devices.
	 * @param {string} device_id - the id of the device whose data is being accessed.
	 * @returns {Object} The MongoDB collection for devices
	 */
	static async getCollection(device_id) {
		const collection = await super.getCollection(device_id.toString());
		return collection;
	}

	/**
	 * Determines if user owns the DeviceData with id
	 * @param {string} device_id - The id of the device to check for ownership.
	 * @param {Object} user - The user to check for ownership.
	 * @returns {boolean} True if the user does own the device, false otherwise.
	 */
	static async owns(device_id, user) {
		return DeviceDatabase.owns(device_id, user)
	}

	/**
	 * Retrieves all device data for a device.
	 * @param {string} device_id - The id of the device.
	 * @returns {Object} The data belonging to the given device.
	 */
	static async getByDevice(device_id) {

		const DeviceData = await this.getCollection(device_id);
		const deviceData = await DeviceData.find({device_id: device_id}).toArray().catch((err) => {
			throw err;
		});

		return this.__formatDeviceData(deviceData);
	}

	/**
	 * Retrieves all device data for a device for a specific data_run.
	 * @param {string} device_id - The id of the device.
	 * @param {number} data_run - The data_run to obtain
	 * @returns {Object} The data belonging to the given device for the data_run.
	 */
	static async getByDeviceDataRun(device_id, data_run) {
		
		// Device data collections are named by their device ID.
		const DeviceData = await this.getCollection(device_id);
		const deviceData = await DeviceData.find({device_id: device_id, data_run: data_run}).toArray().catch((err) => {
			throw err;
		});
		console.log("All data for data_run", data_run, ":", deviceData);

		return this.__formatDeviceData(deviceData);
	}

	/**
	 * Creates a new device data object.
	 * @param {string} device_id - The id of the device the data belongs to.
	 * @param {Object} data - The data being reported by the device.
	 * @returns {Array}
	 */
	static async create(device_id, data) {

		// Obtain the document in the device database which corresponds to the given device_id
		const object = await DeviceDatabase.get(device_id);
		
		// Create a dataRun object with the same number of dataRuns as the device of interest
		let tempDataRun = new DataRun(object.num_dataRuns);
		
		// Device data collections are named by their device ID.
		const DeviceData = await this.getCollection(device_id);
		
		// Determine and set the data_run (number) for the deviceData object (data)
		await tempDataRun.getDataRun(data.data.contents, device_id);
		data.data_run = tempDataRun.dataRun;

		// Update the number of data runs for the device
		await DeviceDatabase.update(device_id, {$set: {num_dataRuns: tempDataRun.num_dataRuns}});
		
		// Insert the data object into the collection for the device
		const insertedData = await DeviceData.insertOne(data).catch(err => {throw err;});
		
		return insertedData;
	}

	static async getByDataRun(device_id, data_run, most_recent=false) {

		const DeviceData = await this.getCollection(device_id);

		if (most_recent) {
				// Get the most recent deviceData document with the corresponding dataRun
			const deviceData = await DeviceData.findOne({data_run: data_run}, {sort:{$natural:-1}}).catch((err) => {
				throw err;
			});

			return deviceData
		}
		else {
			const deviceData = await DeviceData.findOne({data_run: data_run}).catch((err) => {
				throw err;
			});

			return deviceData
		}

	}
	/**
	 * Formats arrays of device data to be more easily accessible
	 * 
	 * @param {Array} deviceData - An array of raw devicedata from the database.
	 * @returns {Array} Reformated device data.
	 * @private
	 */
	static __formatDeviceData(deviceData) {
		return deviceData.map((data, index) => {

			let formatted_device = new Map();

			formatted_device.set("Data_Run", data.data_run);
			formatted_device.set("Date", data.data.timestamp.date);
			formatted_device.set("Time", data.data.timestamp.time);

			// Sensor refers to an object in the "contents" array. For every key
			// in each sensor, concatenate the name of the sensor with the key
			// for the data label and set the data to that label.
			data.data.contents.forEach((sensor) => {
				for (var key in sensor.data) {
					if (sensor.data.hasOwnProperty(key)) {
						formatted_device.set(String(sensor.module) + '-' + String(key), sensor.data[key]);
					}
				}
			});
			return strMapToObj(formatted_device);
		});
	};
}

 /**
 * Defines a class to track the configuration of sensors for Devices.
 *
 * @class DataRun
 */
class DataRun {

    // Set default dataRun to 1 and num_dataRuns to 0
    dataRun = 1;
    num_dataRuns = 0;

    constructor(num_dataRuns) {
        if (num_dataRuns !== null && num_dataRuns !== undefined){
            this.num_dataRuns = num_dataRuns;
        }
        else {
            this.num_dataRuns = 0;
        }
    }

    /**
	 * Determines the data_run for a new deviceData object based on the modules
     * in its contents array.
	 *
	 * 1. For the new deviceData object, fill an array of strings with each
     * module-key pair.
     * 2. For each prior data_run, use one document to fill an array of strings
     * with each module-key pair.
	 * 3. Compare each index of the array. If they match, set the data_run.
     * 4. If the new deviceData object is distinct from all past data_runs,
     * increment the number of data_runs for the Device and set the data_run
     * for the new object to the new maximum.
	 *
	 * @param {string} newSchema - The data contents array of the deviceData
     * object which contains modules and key-value pairs for data points.
	 * @param {string} device_id - The id of the device
	 * @returns {DataRun} The DataRun object which called the function,
     * containing the dataRun for the deviceData object and the total number of
     * data runs for the device.
	 */
    async getDataRun(newSchema, device_id) {

        // This will track if there are any data entries yet. If not, data_run = 1
        let firstEntry = true;

        // Compare newSchema with schema from every past dataRun
        let i;
        for (i = 1; i <= this.num_dataRuns; i++) {

            // Get a schema of module-key pairs from data_run i
            const oldSchema = await DataRun.getSchema(i, device_id);

            // If there is no schema for data_run i, check the next
            if (oldSchema === null || oldSchema === undefined) {
                continue;
            }
            else {
                // If any oldSchema exists, this is not the first entry
                firstEntry = false;
            }

            // First check if the schemas have the same number of sensors
            if (newSchema.length !== oldSchema.length) {
                continue;
            }
            else {
                const sameSchema = await DataRun.compareModules(newSchema, oldSchema);
                // If the new schema matches one prior, set the dataRun and return it
                if (sameSchema === true) {
                    this.dataRun = i;
                    return this;
                }
                // Otherwise, check the next oldSchema
            }
        }

        // If this is the first entry, don't change the dataRun
        if (firstEntry) {
            this.num_dataRuns = 1;
            return this;
        }
        else {
            // newSchema is different from all past schemas, so assign unique dataRun
            this.num_dataRuns = this.num_dataRuns + 1;
            this.dataRun = this.num_dataRuns;
            return this;
        }
    }

    /**
	 * Compares the schemas of two separate deviceData objects.
	 *
	 * 1. Fills an array of strings for each module-key pair
     * 2. Compares the arrays for equality.
	 *
	 * @param {Array} newSchema - The data contents array of the deviceData
     * object which contains modules and key-value pairs for data points.
	 * @param {Array} oldSchema - The data contents array of an old deviceData
     * object which contains modules and key-value pairs for data points.
	 * @returns {{boolean}} - True if they have the same schemas (every
     * module-key pair is identical)
	 */
    static async compareModules (newSchema, oldSchema) {

        let j;
        // Check every sensor in the arrays
        for (j = 0; j < newSchema.length; j++) {

            let newArray = await DataRun.modulekey_Array(j, newSchema);
            let oldArray = await DataRun.modulekey_Array(j, oldSchema);

            // If schemas don't have same number of keys, they are not identical
            if (newArray.length !== oldArray.length) {
                return false
            }

            // Check every data key for every module
            let k;
            for (k = 0; k < newArray.length; k++) {
                const newSchemaSensor = newArray[k];
                const oldSchemaSensor = oldArray[k];

                if (newSchemaSensor !== oldSchemaSensor) {
                    return false; //need to go to the next data run
                }
                // If they are equal, check the next module-key pair
            }
        }
        return true;
    }

    /**
	 * Declares and fills an array with strings for each module-key pair
     * for a single module.
	 *
	 * 1. Counts the number of module-key pairs.
     * 2. Initializes and fills the array with the module-key pairs.
	 *
	 * @param {number} j - The index corresponding to the module within
     * the schema.
	 * @param {Array} schema - The data contents array of a deviceData
     * object which contains modules and key-value pairs for data points.
	 * @returns {{Array}} - Returns the array of strings
	 */
    static async modulekey_Array(j, schema) {

        let modulekey_array = [];

        // Fill array with strings for each module-key pair
        for (let key in schema[j].data) {
			if (schema[j].data.hasOwnProperty(key)) {
					 modulekey_array.push(schema[j].module.toString() + '-' + key.toString());
			}
        }
        return modulekey_array;
    }

    /**
	 * Declares and fills an array with strings for each module-key pair
     * for a single module.
	 *
	 * 1. Counts the number of module-key pairs.
     * 2. Initializes and fills the array with the module-key pairs.
	 *
	 * @param {number} dataRun - The index corresponding to the module within
     * the schema.
	 * @param {string} device_id - The id of the device.
	 * @returns {{Array}} - Returns the data contents array for a single
     * document from the given dataRun.
	 */
    static async getSchema(dataRun, device_id) {
        const deviceData = await DeviceDataDatabase.getByDataRun(device_id, dataRun, true);
		
        // If there are no deviceData documents for the given dataRun, return null
        if (deviceData === null) {
            return deviceData;
        }

        // Return the contents array of module/key objects for each sensor
        return deviceData.data.contents;
    }
}

module.exports = DeviceDataDatabase;
