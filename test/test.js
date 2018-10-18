'use strict';

const expect = require('chai').expect;
const express = require('express');
const { Router } = require('express');
const request = require('request');

// Create the servers
const microServiceServer = createMicroServiceServer();
const gatewayApi = createGatewayApi();

describe('mux-router tests', () => {
    it('Generate avaliable routes on micro service', (done) => {
        
        const patern = JSON.stringify([{ 'path': '/users', 'method': 'get' }, { 'path': '/clients', 'method': 'get' }]);
        const muxRouter = require('../dist/index.js');

        // Export your app routes using muxRouter
        // The routers of your app will be avaliable on http://localhost:3000/mux-router/routes
        muxRouter.generateRoutes([microServiceServer.router]);

        // Set app to use routes of muxRouter to create the route /mux-router/routes
        microServiceServer.app.use('/', muxRouter.router);

        const requestOptions = {
            method: 'GET',
            uri: 'http://localhost:3000/mux-router/routes',
            headers: { 'Content-Type': 'application/json' }
        };

        // Get the routes and check result
        request(requestOptions, (errors, res, body) => {
            expect(body).to.equal(patern);
            done();
        });
    });

    it('Get routes from micro service and create requests in Gateway Api', (done) => {
        
        const patern = JSON.stringify([{ name: 'Thor', email: 'thor@asgard.com' }]);
        const muxRouter = require('../dist/index.js');

        // Import the routes of other app to use
        muxRouter.generateRequests('http://localhost:3000', (req, res, next) => {
            console.log('Redirecting to micro service');

            // Here you can choose to which url redirect the requests
            muxRouter.redirect('http://localhost:3000', req, res, next);
        });

        gatewayApi.app.use('/', muxRouter.router);

        const requestOptions = {
            method: 'GET',
            uri: 'http://localhost:3001/users',
            headers: { 'Content-Type': 'application/json' }
        };

        setTimeout(() => {
            // Get the routes and check result
            request(requestOptions, (errors, res, body) => {
                expect(body).to.equal(patern);
                done();

                microServiceServer.server.close();
                gatewayApi.server.close();
            });
        }, 1000);
    });
});

// Create the gateway api
function createGatewayApi() {
    const app = express();

    return {
        app: app,
        server: app.listen(3001)
    };
}

// Create the micro service server
function createMicroServiceServer() {
    const app = express();
    const router = Router();

    // The routes of your app
    router.get('/users', function (req, res) {
        res.send([{ name: 'Thor', email: 'thor@asgard.com' }]);
    });

    router.get('/clients', function (req, res) {
        res.send([{ name: 'Tony Stark', email: 'tony@starkindustries.com' }]);
    });

    app.use('/', router);

    return {
        app: app,
        server: app.listen(3000),
        router: router
    };
}