// routes/restaurants.js
const express = require('express');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const router = express.Router();

let docClient;

if (process.env.IS_OFFLINE === 'true') {
  const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
  docClient = DynamoDBDocumentClient.from(new DynamoDBClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  }));
} else {
  docClient = DynamoDBDocumentClient.from(new DynamoDBClient());
}

const RESERVATIONS_TABLE = process.env.RESERVATIONS_TABLE;

router.post('/restaurants', async (req, res) => {
  const { id, userId, restaurantId, restaurantName } = req.body;

  if (!id || !userId || !restaurantId || !restaurantName) {
    return res.status(400).json({
      error: 'Missing required fields: id, userId, restaurantId, and restaurantName are all required.',
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

module.exports = router;
