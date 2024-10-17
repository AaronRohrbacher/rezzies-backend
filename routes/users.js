const express = require('express');
const {
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const docClient = require('./helpers/dynamodbClient');
const { RESERVATIONS_TABLE } = require('./helpers/config');
const jwtCheck = require('./helpers/jwtAuth');
const decodeJwt = require('./helpers/decodeJwt');
const { v4: uuidv4 } = require('uuid');
const { QueryCommand } = require('@aws-sdk/client-dynamodb');
const { decode } = require('jsonwebtoken');
const router = express.Router();

router.post('/users', jwtCheck, decodeJwt, async (req, res) => {
  const user = decodeJwt;
  
  const { userId, name } = req.body;
  const type = 'user';
  const id = uuidv4();
  if (!userId || !name) {
    return res.status(400).json({
      error: 'Bad request.',
    });
  }
  const params = {
    TableName: RESERVATIONS_TABLE,
    Item: { id, userId, name, type },
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
    TableName: 'reservations-table-dev',
    ScanIndexForward: false,
    IndexName: 'users',
    KeyConditionExpression: '#8e330 = :8e330',
    FilterExpression: '#8e331 = :8e331',
    ExpressionAttributeValues: {
      ':8e330': {
        S: userId,
      },
      ':8e331': {
        S: 'user',
      },
    },
    ExpressionAttributeNames: {
      '#8e330': 'userId',
      '#8e331': 'type',
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
    res.status(200).json(response.Items);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Could not retrieve user',
    });
  }
});

router.patch('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { name } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Bad Request. userId is required.' });
  }
  const queryParams = {
    TableName: 'reservations-table-dev',
    IndexName: 'users',
    KeyConditionExpression: '#userId = :userId',
    ExpressionAttributeValues: {
      ':userId': { S: userId },
    },
    ExpressionAttributeNames: {
      '#userId': 'userId',
    },
  };
  try {
    const queryCommand = new QueryCommand(queryParams);
    const queryResult = await docClient.send(queryCommand);

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return res
        .status(404)
        .json({ error: `User with userId ${userId} not found.` });
    }
    const user = queryResult.Items[0];
    const id = user.id.S;
    const updateParams = {
      TableName: 'reservations-table-dev',
      Key: {
        id: id,
      },
      UpdateExpression: 'SET #9cbf0 = :9cbf0, #9cbf1 = :9cbf1, #9cbf2 = :9cbf2',
      ExpressionAttributeValues: {
        ':9cbf0': name,
        ':9cbf1': 'user',
        ':9cbf2': userId,
      },
      ExpressionAttributeNames: {
        '#9cbf0': 'name',
        '#9cbf1': 'type',
        '#9cbf2': 'userId',
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

router.delete('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'Bad Request. userId is required.' });
  }
  const queryParams = {
    TableName: 'reservations-table-dev',
    IndexName: 'users',
    KeyConditionExpression: '#userId = :userId',
    ExpressionAttributeValues: {
      ':userId': { S: userId },
    },
    ExpressionAttributeNames: {
      '#userId': 'userId',
    },
  };
  try {
    const queryCommand = new QueryCommand(queryParams);
    const queryResult = await docClient.send(queryCommand);

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return res
        .status(404)
        .json({ error: `User with userId ${userId} not found.` });
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
      message: `User with userId ${userId} deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Could not delete user' });
  }
});

module.exports = router;
