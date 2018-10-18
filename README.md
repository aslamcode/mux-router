# mux-router
It's a [node](http://nodejs.org) module for Micro Services to get avaliable routes and import them in other Gateway App.

## Installation

```bash
$ npm install mux-router
```

## How to export your app routes in your micro service

```javascript
const express = require('express');
const { Router } = require('express');
const mux = require('mux-router');

const app = express();
const router = Router();

// The routes of your app
router.get('/users', function (req, res) {
  res.send([{ name: 'Thor', email: 'thor@asgard.com' }]);
});

router.get('/clients', function (req, res) {
  res.send([{ name: 'Tony Stark', email: 'tony@starkindustries.com' }]);
});

// Export your app routes using mux
// The routers of your app will be avaliable on http://localhost:3000/mux-router/routes
mux.generateRoutes([router]);

app.use('/', router);

// Set app to use routes of mux to create the route /mux-router/routes
app.use('/', mux.router);

app.listen(3000);
```

## How to import the routes of other app in your gateway server

```javascript
const express = require('express');
const mux = require('mux-router');
const app = express();

// Import the routes of other app to use
mux.generateRequests('http://localhost:3000', (req, res, next) => {
  console.log('Redirecting to other app');
  
  // Here you can choose to which url redirect the requests
  mux.redirect('http://localhost:3000', req, res, next);
});

// Set app to use imported routes in other app using mux
app.use('/', mux.router);

app.listen(3001);
```

## Methods
* generateRoutes([Array of express routers]);
* generateRequests(urlRepository, (request, response, nextFunction) => { });
* redirect(urlToRedirectRequests, request, response, nextFunction);

## Tests
To run the test suite, first install the dependencies, then run npm run test:

```bash
$ npm install
$ npm run test
```

## License
[MIT](LICENSE)
