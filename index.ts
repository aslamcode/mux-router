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

import { Request, Response, Router, NextFunction } from "express";
import * as request from "request";
const httpProxy = require("express-http-proxy");

class MuxRouter {

	private _avaliableRoutes: any[] = new Array();
	private _router: Router | any = Router();
	private _request: any = request;
	private _repositoryUrl: string = "mux-router/routes";
	private _httpProxy: any = httpProxy;

	constructor() {
		this.createMuxRouterRoutes();
	}

	// Generate the avaliable routes on default repository route mux-router/routes
	generateRoutes(...routers: any[]) {
		this.createAvaliableRoutes(routers);
	}

	// Generate the avaliable resquests on _router
	generateRequests(repositoryUrl: string, callback: any) {
		this.createRequests(repositoryUrl, callback);
	}

	// Redirect a request
	redirect(url: string, req: any, res: any, next: any) {
		this._httpProxy(url, { parseReqBody: false, reqBodyEncoding: null })(req, res, next);
	}

	// Get the attribute _router
	get router() { return this._router; }

	// Create the avaliables routes on _router
	private createAvaliableRoutes(data: any[]) {
		data.forEach((controllers: any) => {
			controllers.forEach((_router: any) => {
				_router.stack.forEach((func: any) => {
					this._avaliableRoutes.push({
						path: func.route.path,
						method: func.route.stack[0].method
					});
				});
			});
		});
	}

	// Create the mux-router route to get the avaliable routes
	private createMuxRouterRoutes() {
		this._router.get(`/${this._repositoryUrl}`, (req: Request, res: Response) => {
			return res.json(this._avaliableRoutes);
		});
	}

	// Get the routes on remote mux-router and create on _router
	private createRequests(repositoryUrl: string, callback: any) {
		const request = {
			method: "GET",
			uri: `${repositoryUrl}/${this._repositoryUrl}`,
			headers: { "Content-Type": "application/json" }
		};

		this._request(request, (errors: any, response: any, body: any) => {
			try {
				const routes = JSON.parse(body);

				routes.forEach((elem: any) => {
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


export const muxRouter: MuxRouter = new MuxRouter();