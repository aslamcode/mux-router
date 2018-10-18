"use strict";
/*! *****************************************************************************
MIT License

Copyright (c) 2018 Guilherme Martins Arantes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
***************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const request = require("request");
const httpProxy = require("express-http-proxy");
class MuxRouter {
    constructor() {
        this._avaliableRoutes = new Array();
        this._router = express_1.Router();
        this._request = request;
        this._repositoryUrl = "mux-router/routes";
        this._httpProxy = httpProxy;
        this.createMuxRouterRoutes();
    }
    // Generate the avaliable routes on default repository route mux-router/routes
    generateRoutes(...routers) {
        this.createAvaliableRoutes(routers);
    }
    // Generate the avaliable resquests on _router
    generateRequests(repositoryUrl, callback) {
        this.createRequests(repositoryUrl, callback);
    }
    // Redirect a request
    redirect(url, req, res, next) {
        this._httpProxy(url)(req, res, next);
    }
    // Get the attribute _router
    get router() { return this._router; }
    // Create the avaliables routes on _router
    createAvaliableRoutes(data) {
        data.forEach((controllers) => {
            controllers.forEach((_router) => {
                _router.stack.forEach((func) => {
                    this._avaliableRoutes.push({
                        path: func.route.path,
                        method: func.route.stack[0].method
                    });
                });
            });
        });
    }
    // Create the mux-router route to get the avaliable routes
    createMuxRouterRoutes() {
        this._router.get(`/${this._repositoryUrl}`, (req, res) => {
            return res.json(this._avaliableRoutes);
        });
    }
    // Get the routes on remote mux-router and create on _router
    createRequests(repositoryUrl, callback) {
        const request = {
            method: "GET",
            uri: `${repositoryUrl}/${this._repositoryUrl}`,
            headers: { "Content-Type": "application/json" }
        };
        this._request(request, (errors, response, body) => {
            try {
                const routes = JSON.parse(body);
                routes.forEach((elem) => {
                    this._router[elem.method](elem.path, callback);
                });
            }
            catch (errors) {
                console.log(`MuxRouter cannot execute generateRequests(${repositoryUrl}). Problem to connect with ${repositoryUrl}.`);
                // Try create requests again
                setTimeout(() => {
                    this.createRequests(repositoryUrl, callback);
                }, 3000);
            }
        });
    }
}
exports.muxRouter = new MuxRouter();
