const router = require('express').Router();
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
	swaggerDefinition: {
		openapi: '3.0.1',
		// Like the one described here: https://swagger.io/specification/#infoObject
		info: {
			title: 'Spool API',
			version: '0.0.2',
			description: ''
		},
		host: 'localhost:3001',
		basePath: '/',
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT'
				},

			}
		},
		security: [{
		}]
	},
	// List of files to be processes. You can also set globs './routes/*.js'
	apis: ['./api/routes*.js', './api/routes/**/*.js'],

};

const specs = swaggerJsdoc(options);

const swaggerUi = require('swagger-ui-express');

router.use('/', swaggerUi.serve, swaggerUi.setup(specs));

module.exports = router;