const express = require('express');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('./helpers/dynamodbClient');  // Import the DynamoDB client
const { RESERVATIONS_TABLE } = require('./helpers/config');  // Import the configuration
const jwtCheck = require('./helpers/jwtAuth');  // Import jwtCheck middleware
const decodeJwt = require('./helpers/decodeJwt')
const { v4: uuidv4 } = require('uuid');
const { QueryCommand } = require('@aws-sdk/client-dynamodb');
const router = express.Router();

router.post('/users', decodeJwt, async (req, res) => {
  const { userId, name } = req.body;
  const id = uuidv4();
  if (!userId || !name) {
    return res.status(400).json({
      error: 'Bad request.',
    });
  }
  const params = {
    TableName: RESERVATIONS_TABLE,
    Item: { id, userId, name },
  };
  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json('success');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create user' });
  }
});

router.get('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      error: 'Bad Request. userId is required.',
    });
  }
  const params = {
    TableName: RESERVATIONS_TABLE,
    IndexName: 'users',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': {
        'S': userId.toString()
      }
    },
  };

  try {
    const command = new QueryCommand(params);
    const response = await docClient.send(command);
    if (!response.Items || response.Items.length === 0) {
      return res.status(404).json({
        error: `User with userId ${userId} not found.`,
      });
    }
    res.status(200).json(response.Items[0]);  // Return the first item found
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Could not retrieve user',
    });
  }
});

module.exports = router;
