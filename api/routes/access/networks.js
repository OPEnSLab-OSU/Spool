/**
 * @module access/networks
 */


const express = require('express');
const router = express.Router();
const secured = require('../../lib/middleware/secured');
const {wrapAsync}  = require('../../lib/middleware/middleware');
const {createNetwork, getNetwork, getNetworks, deleteNetwork, addNetworkDevice, removeNetworkDevice, getNetworkDevices, updateNetworkPermissions} = require('./networksImpl');

/**
 * @swagger
 * /access/networks/new:
 *     post:
 *         description: Creates a new network.
 *         tags:
 *             - access
 *             - networks
 *         requestBody:
 *             required: true
 *             content:
 *                 'application/json':
 *                     schema:
 *                         type: object
 *                         required:
 *                             - name
 *                         properties:
 *                             name:
 *                                 type: string
 *                                 description: The name of the new network
 *                         example:
 *                             device_id: 'my network'
 *
 */
router.post("/new/", secured, wrapAsync(createNetwork));

/**
 *  @swagger
 *  /access/networks/:
 *      get:
 *          description: Gets all networks belonging to the requesting user.
 *          tags:
 *              - access
 *              - networks
 */
router.get("/", secured, wrapAsync(getNetworks));

/**
 *  @swagger
 *  /access/networks/view/{network_id}:
 *      get:
 *          description: Gets the information for a specific network.
 *          tags:
 *              - access
 *              - networks
 *          parameters:
 *              - in: path
 *                name: network_id
 *                schema:
 *                  type: string
 *                required: true
 *                description: The id of the network being requested.
 */
router.get("/view/:network_id", secured, wrapAsync(getNetwork));

/**
 *  @swagger
 *  /access/networks/devices/{network_id}:
 *      get:
 *          description: Gets all the devices in the network.
 *          tags:
 *              - access
 *              - networks
 *          parameters:
 *              - in: path
 *                name: network_id
 *                schema:
 *                  type: string
 *                required: true
 *                description: The id of the network.
 */
router.get("/devices/:network_id", secured, wrapAsync (getNetworkDevices));

/**
 *  @swagger
 *  /access/networks/add_device/}:
 *      post:
 *          description: Adds a device to the network.
 *          tags:
 *              - access
 *              - networks
 *          requestBody:
 *              required: true
 *              content:
 *                  'application/json':
 *                      schema:
 *                          type: object
 *                          required:
 *                              - device_id
 *                              - network_id
 *                          properties:
 *                              device_id:
 *                                  type: string
 *                                  description: The id of the device.
 *                              network_id:
 *                                  type: string
 *                                  description: The id of the network.
 *
 */
router.post("/add_device/", secured, wrapAsync(addNetworkDevice));

/**
 *  @swagger
 *  /access/networks/remove_device/}:
 *      post:
 *          description: Removes a device from the network.
 *          tags:
 *              - access
 *              - networks
 *          requestBody:
 *              required: true
 *              content:
 *                  'application/json':
 *                      schema:
 *                          type: object
 *                          required:
 *                              - device_id
 *                              - network_id
 *                          properties:
 *                              network_id:
 *                                  type: string
 *                                  description: The id of the network.
 *                              device_id:
 *                                  type: string
 *                                  description: The id of the device.
 */
router.post("/remove_device/", secured, wrapAsync(removeNetworkDevice));

/**
 *  @swagger
 *  /access/networks/delete/:
 *      post:
 *          description: Deletes a network.
 *          tags:
 *              - access
 *              - networks
 *          requestBody:
 *              required: true
 *              content:
 *                  'application/json':
 *                      schema:
 *                          type: object
 *                          required:
 *                              - network_id
 *                          properties:
 *                              network_id:
 *                                  type: string
 *                                  description: The id of the network.
 */
router.post("/delete/", secured, wrapAsync(deleteNetwork));

router.post("/permissions/", secured, wrapAsync(updateNetworkPermissions));

module.exports = router;