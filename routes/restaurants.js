const express = require('express');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('./helpers/dynamodbClient'); // Import the DynamoDB client
const { RESERVATIONS_TABLE } = require('./helpers/config'); // Import the configuration
const jwtCheck = require('./helpers/jwtAuth'); // Import jwtCheck middleware
const decodeJwt = require('./helpers/decodeJwt');
const router = express.Router();

router.post('/restaurants', async (req, res) => {
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
  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json('success');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create restaurant' });
  }
});

router.get('/restaurants/:restaurantId', async (req, res) => {
  const { restaurantId } = req.params;
  if (!restaurantId) {
    return res.status(400).json({
      error: 'Bad Request. restaurantId is required.',
    });
  }
  const params = {
    TableName: 'reservations-table-dev',
    ScanIndexForward: false,
    IndexName: 'users',
    KeyConditionExpression: '#8e330 = :8e330',
    FilterExpression: '#8e331 = :8e331',
    ExpressionAttributeValues: {
      ':8e330': {
        S: restaurantId,
      },
      ':8e331': {
        S: 'user',
      },
    },
    ExpressionAttributeNames: {
      '#8e330': 'restaurantId',
      '#8e331': 'type',
    },
  };
  try {
    const command = new QueryCommand(params);
    const response = await docClient.send(command);
    if (!response.Items || response.Items.length === 0) {
      return res.status(404).json({
        error: `User with restaurantId ${restaurantId} not found.`,
      });
    }
    res.status(200).json(response.Items);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Could not retrieve user',
    });
  }
});


module.exports = router;
