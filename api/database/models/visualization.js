/**
 * Created by eliwinkelman on 9/20/19.
 */

const { DatabaseInterface } = require("../db") ;
const DeviceDatabase = require("./device");

const ObjectID = require('mongodb').ObjectID;

class VisualizationModel {
	constructor(visualizationData) {
		this.name = visualizationData.name;
		this.device_id = visualizationData.device_id;
		this.visualization_id = visualizationData.visualization_id;
		this.owner = visualizationData.owner;
		this.graph = visualizationData.graph;
	}
}

/**
 * Manages the database storage for Visualization objects.
 * @class
 * @implements DatabaseInterface
 */
class VisualizationDatabase extends DatabaseInterface {

	/**
	 * Helper function to get the collection of visualizations.
	 * @returns {Object} The MongoDB collection object for visualizations.
	 */
	static async getCollection() {
		const collection = await super.getCollection("Visualization");
		return collection;
	}

	/**
	 * Override the default permission checking on the visualization object and defer to the network instead
     * @param {string} id - the database id of the object to check permissions for
     * @param {string[]} permission_names - An array of permission names to look for
     * @param {Object} user - the user to check permissions for
     * @returns {Promise.<void>}
     */
	static async checkPermissions(id, permission_names, user) {
		const visualization = await this.get(id);

		const device_id = visualization.device_id;

		return await DeviceDatabase.checkPermissions(device_id, permission_names, user);
	}

	/**
	 * Determines if user owns the visualization data with the specified visualization_id.
	 *
	 * @param {string} visualization_id - The id of the visualization to check for ownership.
	 * @param {Object} user - The user to check for ownership.
	 * @returns {boolean} True if the user does own the visualization, false otherwise.
	 */
	static async owns(visualization_id, user) {
		const visualization = await this.get(visualization_id);
		
		return user._id.toString() === visualization.owner.toString()
	}

	/**
	 * Retrieves all visualizations associated with a device.
	 *
	 * @param {string} device_id - The id of the device.
	 * @param {Object} user - The user requesting the visualizations.
	 * @returns {Array} An array of visualization objects.
	 * @throws If the user doesn't own the device
	 */
	static async getByDevice(device_id) {

		const VisualizationCollection = await this.getCollection();

		return await VisualizationCollection.find({device_id: device_id}).toArray();
	}

	/**
	 * Retrieves a visualization by id.
	 * @param {string} visualization_id
	 * @returns {Object}
	 */
	static async get(visualization_id) {

		const VisualizationCollection = await this.getCollection();

		let visualizations = await VisualizationCollection.find({visualization_id: visualization_id.toString()}).toArray();

		return visualizations[0]
	}

	/**
	 * Creates a visualization data object in the database.
	 * @param {Object} visualizationData - The visualization object.
	 * @param {string} device_id - The device id the visualization belongs to.
	 * @param {Object} user - The user creating the visualization.
	 */
	static async create(visualizationData, device_id, user) {

		const VisualizationCollection = await this.getCollection();
		
		//generate a device_id
		const visualization_id = new ObjectID();
		visualizationData.visualization_id = visualization_id.toString();
		visualizationData.owner = user._id;
		visualizationData.device_id = device_id;

		let analysis = new VisualizationModel(visualizationData);

		let _ = await VisualizationCollection.insertOne(analysis).catch((err) => {throw err;});
	}

	/**
	 * Updates an existing visualization object.
	 * @param {string} visualization_id - The id of the 
	 * @param {Object} update - The update to apply (written with the mongodb syntax)
	 * @param {Object} user - The user asking for the update.
	 * @returns {boolean}
	 */
	static async update(visualization_id, update, user) {

		const VisualizationCollection = await this.getCollection();

		const visualizationData = new VisualizationModel(update);

		let _ = await VisualizationCollection.replaceOne({visualization_id: visualization_id.toString()}, visualizationData).catch((err) => {throw(err)});
		
		return true;
	}

	/**
	 * Deletes a visualization object.
	 * @param visualization_id - The id of the object.
	 * @param user - The user requesting deletion.
	 */
	static async del(visualization_id, user) {

		const VisualizationCollection = await this.getCollection();
		
		let _ = await VisualizationCollection.deleteOne({visualization_id: visualization_id.toString()}).catch((err) => {throw(err)});
		
	}
}

module.exports = VisualizationDatabase;