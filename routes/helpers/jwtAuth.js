// routes/helpers/jwtAuth.js
const { auth } = require('express-oauth2-jwt-bearer');

const jwtCheck = auth({
  audience: 'http://localhost:3000',
  issuerBaseURL: 'https://dev-dknrub66od10a3x7.us.auth0.com/',
  tokenSigningAlg: 'RS256',
});

module.exports = jwtCheck;
