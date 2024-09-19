// handler.js
const express = require('express');
const serverless = require('serverless-http');
const { auth } = require('express-oauth2-jwt-bearer');
const restaurantsRoutes = require('./routes/restaurants');  // Import your routes file

const app = express();
app.use(express.json());

const jwtCheck = auth({
  audience: 'http://localhost:3000',
  issuerBaseURL: 'https://dev-dknrub66od10a3x7.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});

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
  handler: serverless(app),  // Lambda handler
  app,  // Express app
};
