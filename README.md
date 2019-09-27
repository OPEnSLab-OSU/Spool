
# Spool
An application to manage your Loom devices and data.

## Table of Contents
* Getting Started
  * Using the OPEnS Lab Spool
  * Self Hosting
* Device API
* User API
* User Pages
* Authentication
* Extending Spool

## Getting Started

### Using the OPEnS Lab Spool
If you are just trying to use spool for storing data from your devices for research, you can get free access to the OPEnS Lab Spool instance by submitting a request form here (ADD LINK).

Read the user guide for the application here (ADD LINK).

### Self Hosting

If you want to run your own instance of Spool, there are a few setup steps you need to complete.
1. Setting up MongoDB
2. Install NodeJS and MongoDB
3. Configuring Auth0 for User Authentication

See the setup guide (ADD LINK) on the OPEnS Wiki.

## Device API

These are endpoints for the device to interact with the application.
Authentication: Mutual TLS Authentication will be used to authenticate devices. The authorized() middleware function will be used to verify the identity of the device.

### Record Datapoint
Records a datapoint sent from a registered device
**post '/device/data'**
Request Format:
{
"device_id”: <Device ID - string>, (specific to each piece of hardware reporting data)
"data_run": <Data run ID - string>, (specific to each set of data collection)
	"data" : <json data provide from loom Manager.package()>
}

Function: 
Find device_type using device ID.
Insert request data object into db.collection(device_type).

Return: If successful, return created object. Otherwise, return error codes.

### Get Configuration - Future
Gets a new configuration for the device, if one exists.
**post ‘/device/configuration’**
Request Format: 
{
	“device_id”: <Device ID - string>
	“current_config”: <the timestamp of the current config - int>
}

Function:
Check if there is a newer config by checking timestamps.
If there is a new config, send it as the response. Otherwise, send None/0 (not sure what type of null json supports in javascript and arduino.)

Response: 
{
	“config”: The newer config, or None/0
}

## User Pages

## Authentication

## Extending Spool
