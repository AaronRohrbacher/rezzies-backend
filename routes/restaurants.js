const express = require('express');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('./helpers/dynamodbClient');  // Import the DynamoDB client
const { RESERVATIONS_TABLE } = require('./helpers/config');  // Import the configuration
const jwtCheck = require('./helpers/jwtAuth');  // Import jwtCheck middleware
const decodeJwt = require('./helpers/decodeJwt')
const router = express.Router();

router.post('/restaurants', jwtCheck, decodeJwt, async (req, res) => {
  const { id, userId, restaurantId, restaurantName } = req.body;
  if (!id || !userId || !restaurantId || !restaurantName) {
    return res.status(400).json({
      error: 'Bad request.',
    });
  }
  const params = {
    TableName: RESERVATIONS_TABLE,
    Item: { id, userId, restaurantId, restaurantName },
  };
  console.log('Decoded JWT:', req.user);
  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json('success');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create restaurant' });
  }
});

module.exports = router;
