/**
 * Created by eliwinkelman on 8/21/20.
 */

const app = require('../../../../api/app');
const getAccessToken = require('../../../lib/auth');
const https = require('https');
const request = require('supertest')(app);
const assert = require('assert');
const { useClient } = require('../../../../api/database/db');
const Auth0UserManager = require('../../../../api/database/models/user');

describe('Network API Usage', function() {
    let app;

    let accessToken;
    let accessToken2;
    let mongod;

    before(async () => {
        // get the database
        const client = await useClient().catch(error => {console.log(error)});
        mongod = client.db("Loom");
        // clear the database, just in case
        mongod.dropDatabase();

        // if need any seed data can put it here...
    });

    beforeEach(async () => {
        accessToken = await getAccessToken();
        accessToken2 = await getAccessToken(false);
        return true;
    });

    describe('Creating networks', function() {

        it('should create a network', function(done) {
        request
          .post('/api/access/networks/new')
          .set('Content-Type', 'application/json')
            .set('Authorization', `bearer ${accessToken}`)
          .send({name: 'test network'})
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {

                if (err) return done(err);
                done()
            })
        });

        it('should create a second network', function(done) {
        request
          .post('/api/access/networks/new')
          .set('Content-Type', 'application/json')
            .set('Authorization', `bearer ${accessToken}`)
          .send({name: 'second test network'})
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {

                if (err) return done(err);
                done()
            })
        });
    });

    describe('Viewing networks', function() {
        it('should get a users networks', function(done) {
        request
            .get('/api/access/networks/')
            .set('Accept', 'application/json')
            .set('Authorization', `bearer ${accessToken}`)
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);

                // make sure we get exactly two networks
                assert(res.body.networks.length === 2);
                done()
            })
        })
    });

    describe('Delete a network', function() {
        let network_id;
        let Networks;

        before(async () => {
            Networks = await mongod.collection('Networks');
            const networks = await Networks.find({}).toArray();
            network_id = networks[0]._id;
        });

        it('should delete a network', async function() {

            const response = await request
                .post('/api/access/networks/delete/')
                .set('Content-Type', 'application/json')
                .set('Authorization', `bearer ${accessToken}`)
                .send({network_id: network_id})
                .expect('Content-Type', /json/)
                .expect(200);

            // verify the network is gone
            const postDeleteNetwork = await Networks.find({_id: network_id}).toArray();

            assert(postDeleteNetwork.length === 0);

            return true;
        });

        it('should remove network from user view', async function() {

            const response = await request
            .get('/api/access/networks/')
            .set('Accept', 'application/json')
            .set('Authorization', `bearer ${accessToken}`)
            .expect('Content-Type', /json/)
            .expect(200);

            // make sure that
            assert(!response.body.networks.map((el) => {return el.network_id}).includes(network_id));

            return true;
        })
    });

    describe('Networks with more devices', function() {
        let network_id;
        let Networks;
        let device_ids;

        before(async () => {

            // find the second network id
            Networks = await mongod.collection('Networks');
            const networks = await Networks.find({}).toArray();
            network_id = networks[0]._id;

        });

        describe('Adding devices to a network', function() {

            it('should add a device', async function() {

                const response = await request
                    .post('/api/access/devices/register/')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', `bearer ${accessToken}`)
                    .send({name: "test device", network_id: network_id})
                    .expect('Content-Type', /json/)
                    .expect(200);

                return true;
            });

            it('should add a second device', async function() {

                const response = await request
                    .post('/api/access/devices/register/')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', `bearer ${accessToken}`)
                    .send({name: "test device", network_id: network_id})
                    .expect('Content-Type', /json/)
                    .expect(200);

                return true;
            });

        });

        describe('Viewing the network\'s devices', function() {

            it('should show the devices', async function () {
                const response = await request
                    .get('/api/access/networks/devices/'+network_id)
                    .set('Accept', 'application/json')
                    .set('Authorization', `bearer ${accessToken}`)
                    .expect('Content-Type', /json/)
                    .expect(200);

                // make sure we have exactly the coordinator device and the two added devices
                assert(response.body.devices.length === 3)

            })

        });

        describe('Deleting a network with devices', function() {
            let device_ids = [];

            before(async () => {

                const networks = await Networks.find({_id: network_id}).toArray();

                device_ids = networks[0].devices;

            });

            it('should delete the network', async function() {

                const response = await request
                .post('/api/access/networks/delete/')
                .set('Content-Type', 'application/json')
                .set('Authorization', `bearer ${accessToken}`)
                .send({network_id: network_id})
                .expect('Content-Type', /json/)
                .expect(200);

                    // verify the network is gone
                const postDeleteNetwork = await Networks.find({_id: network_id}).toArray();

                assert(postDeleteNetwork.length === 0);

            });

            it('should delete the devices', async function() {

                const Devices = mongod.collection("Devices");

                // make sure all the devices in the network were deleted
                for (let device_id in device_ids) {

                    assert((await Devices.find({device_id: device_id}).toArray()).length === 0)

                }
            })
        })
    });

    describe('Networks with multiple users', function() {
        let network_id;
        let Networks;
        before(async () => {
            mongod.dropDatabase();

            await request
              .post('/api/access/networks/new')
              .set('Content-Type', 'application/json')
                .set('Authorization', `bearer ${accessToken}`)
              .send({name: 'test network'})
              .expect('Content-Type', /json/);

            Networks = await mongod.collection('Networks');
            const networks = await Networks.find({}).toArray();
            network_id = networks[0]._id;
        });

        describe('with the other user', function() {

            it('shouldn\'t allow another user to view', function(done) {

                request
                    .get('/api/access/networks/')
                    .set('Accept', 'application/json')
                    .set('Authorization', `bearer ${accessToken2}`)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);

                        // make sure we get exactly two networks
                        assert(res.body.networks.length === 0);
                        done()
                    })

            });
        });

        describe('adding permissions to other user', function() {
            it('should add view permissions to a user', async function() {

                const user = await Auth0UserManager.getByAuth0Id('auth0|5f43eb71022f3a003d4907e8');

                const permissions = {};
                permissions[user._id] = ['view'];
                await request
                  .post('/api/access/networks/permissions/')
                  .set('Content-Type', 'application/json')
                  .set('Authorization', `bearer ${accessToken}`)
                  .send({network_id: network_id, permissions: permissions})
                  .expect(200);

                return true
            });
        });

       describe('with the other user', function() {
           it('should allow user to view', function(done) {

                request
                    .get('/api/access/networks/')
                    .set('Accept', 'application/json')
                    .set('Authorization', `bearer ${accessToken2}`)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                        if (err) return done(err);

                        // make sure we get exactly two networks
                        assert(res.body.networks.length === 1);
                        done();
                    })
            })
       })
    })
});