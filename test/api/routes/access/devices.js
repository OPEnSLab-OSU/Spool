/**
 * Created by eliwinkelman on 8/20/20.
 */

const app = require('../../../../api/app');
const getAccessToken = require('../../../lib/auth');
const https = require('https');
const request = require('supertest')(app);

describe('Network API Endpoints', function() {
    let app;

    let accessToken;
    before(async () => {
        accessToken = await getAccessToken();
    });

    it('should create a network', function(done) {
        request
          .post('/api/access/networks/new')
          .set('Content-Type', 'application/json')
            .set('Authorization', `bearer ${accessToken}`)
          .send({name: 'test network'})
          .expect('Content-Type', /json/)
          .expect(200, done);
    })
});