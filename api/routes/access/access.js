/**
 * Created by eliwinkelman on 7/10/19.
 */


var express = require('express');
var router = express.Router();
var wrapAsync = require('../../lib/middleware/asyncWrap');
var AnalysisManager = require('../../Analysis/Analysis');
// Certificate Generation
var ClientCertFactory = require('../../lib/ClientCertFactory');
var pem = require('pem');
var getKeys = require("../../lib/manageKeys");

const secured = require('./../../lib/middleware/secured');
const userInApi = require('./../../lib/middleware/userInApi');

const deviceRouter = require('./devices');
const visualizationRouter = require('./visualizations');

//MongoDB
var mongoClient = require('../../javascript/db');
const ObjectID = require('mongodb').ObjectID;


//API JSON Schema Validation
var {Validator, ValidationError} = require('express-json-validator-middleware');
var validator = new Validator({allErrors: true});
// Define a shortcut function
var validate = validator.validate;
const {RegisterDeviceSchema, GetUsersDevicesSchema} = require('./../api');

router.use(secured);
router.use(userInApi());
router.use('/devices', deviceRouter);
router.use('/visualization', visualizationRouter);

module.exports = router;
