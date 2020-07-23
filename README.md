
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

### Running Spool for Development

1. Create a folder called "SpoolServer" e.g. `mkdir SpoolServer`
2. Move into this new folder e.g. `cd SpoolServer`
2. Clone the Spool Repository e.g. `git clone githuburl`
3. Create a new folder called "secrets" e.g. `mkdir secrets`. This is were the authentication keys for mongoDB and auth0 are stored.
4. Run `npm install` to install npm dependencies.
5. Set up development services (see instructions below)
6. Move into the Spool git repository folder e.g. `cd Spool`

To run the front-facing application (i.e. what human users access) run `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up` in the `SpoolServer/Spool` directory. To run the device facing api (i.e. where devices send data) run `docker-compose -f docker-compose.device.yml -f docker-compose.device.dev.yml`.

If you run into general issues with the application not starting or stalling inside the docker container, try updating npm packages with `npm update` in `SpoolServer/Spool`.

#### Setting up development services
For OPEnS lab users: 
1. If you work at OPEnS Lab request the secrets for the development mongodb and the development Auth0 from Maddie Smith. Put these files in the secrets folder you created above.
2. There is a test user for the development application with username: testuser and password: test
3. In the MongoDB Atlas project for "Spool (Development)" under "Security > Network Access" add your IP address to the whitelisted IP address. (You'll need Maddie to either add your IP address or invite you to the Atlas project.)

For non-OPEnS lab users:

Configuring Auth0

Configuring MongoDB


### Using the OPEnS Lab Spool
If you are just trying to use spool for storing data from your devices for research, you can get free access to the OPEnS Lab Spool instance by submitting a request form here (ADD LINK).

Read the user guide for the application here (ADD LINK).

### Self Hosting

If you want to run your own instance of Spool, there are a few setup steps you need to complete.
1. Setting up MongoDB
2. Install NodeJS and MongoDB
3. Configuring Auth0 for user authentication
4. Setting up a Certificate Authority to authenticate devices

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
