/**
 * Created by smitmad9 on 8/17/20.
 */

class DataRun {

    // Set default dataRun and num_dataRuns to 0
    dataRun = 1;
    num_dataRuns = 1;

    constructor(dataRun) {
        if (dataRun !== null && dataRun !== undefined){
            this.dataRun = dataRun;
        }
        else {
            this.dataRun = 1;
        }
    }

    async getDataRun(newSchema, DeviceData) {

        const oldSchema = await this.getSchema(1, DeviceData);

        // Compare every module in newSchema with schema from dataRun i
        let i;
        for (i = 1; i <= this.num_dataRuns; i++) {
            // First check if the schemas have the same number of sensors
            console.log("NumElements in Current Schema: ", newSchema.length);
            console.log("NumElements in OldSchema: ", oldSchema.length);
            if (newSchema.length !== oldSchema.length) {
                console.log ("Num sensors does not match schema for data_run ", i);
                continue;
            }
            else {
                const sameSchema = await this.compareModules(newSchema, oldSchema);
                if (sameSchema === true) {
                    console.log("Schemas match at dataRun ", i);
                    this.dataRun = i;
                    return this.dataRun;
                }
            }
        }

        // newSchema is different from all past schemas, so assign unique dataRun
        this.num_dataRuns = this.num_dataRuns + 1;
        this.dataRun = this.num_dataRuns;
        return this.dataRun;

    }

    async compareModules (newSchema, oldSchema) {

        let j;
        // Check every sensor in the newSchema array
        for (j = 0; j < newSchema.length; j++) {

            // Check every data key for every module
            for (var key in newSchema[j].data) {

                if (newSchema[j].data.hasOwnProperty(key)) {
                    const newSchemaSensor = String(newSchema[j].module) + '-' + String(key);
                    const oldSchemaSensor = String(oldSchema[j].module) + '-' + String(key);

                    if (newSchemaSensor !== oldSchemaSensor) {
                        console.log("Module-key paire does not match!!!");
                        console.log("New Sensor: ", newSchemaSensor);
                        console.log("Old Sensor: ", oldSchemaSensor);
                        return false; //need to go to the next data run
                    }      
                    // If they are equal, check the next module-key pair
                }
            }
        }
        console.log("Schemas are the same.");
        return true;
    }

    async getSchema(dataRun, DeviceData) {
        
        // Get the most recent deviceData document with the corresponding dataRun
		const deviceData = await DeviceData.findOne({data_run: dataRun}, {sort:{$natural:-1}}).catch((err) => {
			console.log(err);
			throw err;
		});
        
		return deviceData.data.contents;
    }
}

module.exports = DataRun;