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

router.post('/restaurants/:restaurantId/tables', async (req, res) => {
  const { tableId, tableName } = req.body;
  const { restaurantId }= req.params
  const id = uuidv4();
  if (!id || !restaurantId || !tableId || !tableName) {
    return res.status(400).json({
      error: 'Bad request.',
    });
  }
  const params = {
    TableName: RESERVATIONS_TABLE,
    Item: { id, restaurtantId, tableId, tableName },
  };
  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json('success');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create table' });
  }
});

router.get('/restaurants/:restaurantId/tables/:tableId', async (req, res) => {
  const { tableId } = req.params;
  if (!tableId) {
    return res.status(400).json({
      error: 'Bad Request. tableId is required.',
    });
  }
  const params = {
    TableName: 'reservations-table-dev',
    ScanIndexForward: false,
    IndexName: 'tables',
    KeyConditionExpression: '#8e330 = :8e330',
    ExpressionAttributeValues: {
      ':8e330': {
        S: tableId,
      },
    },
    ExpressionAttributeNames: {
      '#8e330': 'tableId',
    },
  };
  try {
    const command = new QueryCommand(params);
    const response = await docClient.send(command);
    if (!response.Items || response.Items.length === 0) {
      return res.status(404).json({
        error: `Table with tableId ${tableId} not found.`,
      });
    }
    res.status(200).json(response.Items);
  } catch (error) {
    console.error('Error fetching Table:', error);
    res.status(500).json({
      error: 'Could not retrieve Table',
    });
  }
});

router.patch('/restaurants/:restaurantId/tables/:tableId', async (req, res) => {
  const { tableId } = req.params;
  const { name } = req.body;
  if (!tableId) {
    return res.status(400).json({ error: 'Bad Request. restaurtantId is required.' });
  }
  const queryParams = {
    TableName: 'reservations-table-dev',
    IndexName: 'tables',
    KeyConditionExpression: '#tableId = :tableId',
    ExpressionAttributeValues: {
      ':tableId': { S: tableId },
    },
    ExpressionAttributeNames: {
      '#tableId': 'tableId',
    },
  };
  try {
    const queryCommand = new QueryCommand(queryParams);
    const queryResult = await docClient.send(queryCommand);

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return res
        .status(404)
        .json({
          error: `restaurant with tableId ${tableId} not found.`,
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
        ':9cbf2': tableId,
      },
      ExpressionAttributeNames: {
        '#9cbf0': 'name',
        '#9cbf1': 'type',
        '#9cbf2': 'tableId',
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

router.delete('/restaurants/:restaurantId/tables/:tableId', async (req, res) => {
  const { tableId } = req.params;
  if (!tableId) {
    return res
      .status(400)
      .json({ error: 'Bad Request. tableId is required.' });
  }
  const queryParams = {
    TableName: 'reservations-table-dev',
    IndexName: 'tables',
    KeyConditionExpression: '#tableId = :tableId',
    ExpressionAttributeValues: {
      ':tableId': { S: tableId },
    },
    ExpressionAttributeNames: {
      '#tableId': 'tableId',
    },
  };
  try {
    const queryCommand = new QueryCommand(queryParams);
    const queryResult = await docClient.send(queryCommand);

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return res
        .status(404)
        .json({
          error: `Table with tableId ${tableId} not found.`,
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
      message: `table with tableId ${tableId} deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ error: 'Could not delete table' });
  }
});

module.exports = router;
