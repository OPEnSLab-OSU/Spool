/**
 * Created by smitmad9 on 8/17/20.
 */

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
	 * @param {Object} DeviceData - The collection of deviceData documents for
     * the Device.
	 * @returns {{dataRun: number, num_dataRuns: number}} An object containing
     * the dataRun for the deviceData object and the number of data runs for
     * the device.
	 */
    async getDataRun(newSchema, DeviceData) {
    
        // This will track if there are any data entries yet. If not, data_run = 1
        let firstEntry = true;

        // Compare newSchema with schema from every past dataRun
        let i;
        for (i = 1; i <= this.num_dataRuns; i++) {
            
            // Get a schema of module-key pairs from data_run i
            const oldSchema = await this.getSchema(i, DeviceData);

            // If there is no schema for data_run i, check the next
            if (oldSchema === null || oldSchema === undefined) {
                continue;
            }
            else {
                // If any oldSchema exists, this is not the first entry
                console.log("Found an oldSchema for data run:", i);
                firstEntry = false;
            }

            // First check if the schemas have the same number of sensors
            if (newSchema.length !== oldSchema.length) {
                console.log("New NumElements: ", newSchema.length);
                console.log("Old NumElements: ", oldSchema.length);
                console.log ("Num sensors does not match schema for data_run ", i);
                continue;
            }
            else {
                const sameSchema = await this.compareModules(newSchema, oldSchema);
                // If the new schema matches one prior, set the dataRun and return it
                if (sameSchema === true) {
                    console.log("Schemas match at dataRun ", i);
                    this.dataRun = i;
                    return this;
                }
                // Otherwise, check the next oldSchema
            }
        }

        // If this is the first entry, don't change the dataRun
        if (firstEntry) {
            console.log("This is the first data entry for this device.");
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
    async compareModules (newSchema, oldSchema) {

        let j;
        // Check every sensor in the arrays
        for (j = 0; j < newSchema.length; j++) {

            let newArray = await this.modulekey_Array(j, newSchema);
            let oldArray = await this.modulekey_Array(j, oldSchema);

            // If schemas don't have same number of keys, they are not identical
            if (newArray.length !== oldArray.length) {
                console.log("Modules do not have the same number of keys at ", newSchema[j].module);
                return false
            }

            // Check every data key for every module
            let k;
            for (k = 0; k < newArray.length; k++) {
                const newSchemaSensor = newArray[k];
                const oldSchemaSensor = oldArray[k];

                if (newSchemaSensor !== oldSchemaSensor) {
                    console.log("Module-key pair does not match!!!");
                    console.log("New Sensor: ", newSchemaSensor);
                    console.log("Old Sensor: ", oldSchemaSensor);
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
    async modulekey_Array(j, schema) {

        // Determine the number of keys in the data object
        let numkeys = 0;
        for (var key in schema[j].data) {
            if (schema[j].data.hasOwnProperty(key)) {
                numkeys++;
            }
        }
        let modulekey_array = new Array(numkeys);
        
        // Fill array with strings for each module-key pair
        let i = 0;
        for (var key in schema[j].data) {
            modulekey_array[i] = String(schema[j].module) + '-' + String(key);
            i++;
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
	 * @param {number} j - The index corresponding to the module within
     * the schema.
	 * @param {Object} DeviceData - The collection of deviceData documents for
     * the Device.
	 * @returns {{Array}} - Returns the data contents array for a single
     * document from the given dataRun.
	 */
    async getSchema(dataRun, DeviceData) {
        
        // Get the most recent deviceData document with the corresponding dataRun
		const deviceData = await DeviceData.findOne({data_run: dataRun}, {sort:{$natural:-1}}).catch((err) => {
			console.log(err);
			throw err;
        });

        // If there are no deviceData documents for the given dataRun, return null
        if (deviceData === null) {
            return deviceData;
        }
        
        // Return the contents array of module/key objects for each sensor
        return deviceData.data.contents;
    }
}

module.exports = DataRun;