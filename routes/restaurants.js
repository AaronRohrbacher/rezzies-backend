const express = require('express');
const {
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const { QueryCommand } = require('@aws-sdk/client-dynamodb');
const docClient = require('./helpers/dynamodbClient'); // Import the DynamoDB client
const { RESERVATIONS_TABLE } = require('./helpers/config'); // Import the configuration
const jwtCheck = require('./helpers/jwtAuth'); // Import jwtCheck middleware
const decodeJwt = require('./helpers/decodeJwt');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

router.post('/restaurants', async (req, res) => {
  const { userId, restaurantId, restaurantName } = req.body;
  const id = uuidv4();
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
    IndexName: 'restaurants',
    KeyConditionExpression: '#8e330 = :8e330',
    ExpressionAttributeValues: {
      ':8e330': {
        S: restaurantId,
      },
    },
    ExpressionAttributeNames: {
      '#8e330': 'restaurantId',
    },
  };
  try {
    const command = new QueryCommand(params);
    const response = await docClient.send(command);
    if (!response.Items || response.Items.length === 0) {
      return res.status(404).json({
        error: `Restaurant with restaurantId ${restaurantId} not found.`,
      });
    }
    res.status(200).json(response.Items);
  } catch (error) {
    console.error('Error fetching Restaurant:', error);
    res.status(500).json({
      error: 'Could not retrieve Restaurant',
    });
  }
});

router.patch('/restaurants/:restaurantId', async (req, res) => {
  const { restaurantId } = req.params;
  const { name } = req.body;
  if (!restaurantId) {
    return res.status(400).json({ error: 'Bad Request. userId is required.' });
  }
  const queryParams = {
    TableName: 'reservations-table-dev',
    IndexName: 'restaurants',
    KeyConditionExpression: '#restaurantId = :restaurantId',
    ExpressionAttributeValues: {
      ':restaurantId': { S: restaurantId },
    },
    ExpressionAttributeNames: {
      '#restaurantId': 'restaurantId',
    },
  };
  try {
    const queryCommand = new QueryCommand(queryParams);
    const queryResult = await docClient.send(queryCommand);

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return res
        .status(404)
        .json({
          error: `restaurant with restaurantId ${restaurantId} not found.`,
        });
    }
    const restaurant = queryResult.Items[0];
    const id = restaurant.id.S;
    const updateParams = {
      TableName: 'reservations-table-dev',
      Key: {
        id: id,
      },
      UpdateExpression: 'SET #9cbf0 = :9cbf0, #9cbf1 = :9cbf1, #9cbf2 = :9cbf2',
      ExpressionAttributeValues: {
        ':9cbf0': name,
        ':9cbf1': 'restaurant',
        ':9cbf2': restaurantId,
      },
      ExpressionAttributeNames: {
        '#9cbf0': 'name',
        '#9cbf1': 'type',
        '#9cbf2': 'restaurantId',
      },
    };
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
    let updateDocClient;
    if (process.env.IS_OFFLINE === 'true') {
      updateDocClient = DynamoDBDocumentClient.from(
        new DynamoDBClient({
          region: 'localhost',
          endpoint: 'http://localhost:8000',
        })
      );
    } else {
      updateDocClient = DynamoDBDocumentClient.from(new DynamoDBClient());
    }
    const updateCommand = new UpdateCommand(updateParams);
    await updateDocClient.send(updateCommand);
    res.status(200).json({
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Could not update user' });
  }
});

router.delete('/restaurants/:restaurantId', async (req, res) => {
  const { restaurantId } = req.params;
  if (!restaurantId) {
    return res
      .status(400)
      .json({ error: 'Bad Request. restaurantId is required.' });
  }
  const queryParams = {
    TableName: 'reservations-table-dev',
    IndexName: 'restaurants',
    KeyConditionExpression: '#restaurantId = :restaurantId',
    ExpressionAttributeValues: {
      ':restaurantId': { S: restaurantId },
    },
    ExpressionAttributeNames: {
      '#restaurantId': 'restaurantId',
    },
  };
  try {
    const queryCommand = new QueryCommand(queryParams);
    const queryResult = await docClient.send(queryCommand);

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return res
        .status(404)
        .json({
          error: `Restaurant with restaurantId ${restaurantId} not found.`,
        });
    }
    const user = queryResult.Items[0];
    const id = user.id.S;
    const deleteParams = {
      TableName: 'reservations-table-dev',
      Key: {
        id: id,
      },
    };
    const deleteCommand = new DeleteCommand(deleteParams);
    await docClient.send(deleteCommand);
    res.status(200).json({
      message: `restaurant with restaurantId ${restaurantId} deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    res.status(500).json({ error: 'Could not delete restaurant' });
  }
});

module.exports = router;
