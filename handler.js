// handler.js
const express = require('express');
const serverless = require('serverless-http');
const jwtCheck = require('./routes/helpers/jwtAuth');  // Import the jwtCheck function
const restaurantsRoutes = require('./routes/restaurants');  // Import your routes file

const app = express();
app.use(express.json());

// Enforce JWT authentication on all endpoints
// app.use(jwtCheck);

app.get('/authorized', jwtCheck, function (req, res) {
  res.send('Secured Resource');
});

// Use the routes from restaurants.js
app.use('/', restaurantsRoutes);

app.use((req, res, next) => {
  return res.status(404).json({
    error: 'Not Found',
  });
});

module.exports = {
  // handler: serverless(app),  // Lambda handler
  app,  // Express app
};
