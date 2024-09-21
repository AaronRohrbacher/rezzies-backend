const express = require('express');
const { PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const docClient = require('./helpers/dynamodbClient');  // Import the DynamoDB client
const { RESERVATIONS_TABLE } = require('./helpers/config');  // Import the configuration
const jwtCheck = require('./helpers/jwtAuth');  // Import jwtCheck middleware
const decodeJwt = require('./helpers/decodeJwt')
const { v4: uuidv4 } = require('uuid');
const { QueryCommand } = require('@aws-sdk/client-dynamodb');
const router = express.Router();

router.post('/users', async (req, res) => {
  const { userId, name } = req.body;
  const type = "user"
  const id = uuidv4();
  console.log(id)
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
  // return res.send("FUCK")
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({
      error: 'Bad Request. userId is required.',
    });
  }
  const params = {
    TableName: "reservations-table-dev",
    ScanIndexForward: false,
    IndexName: "users",
    KeyConditionExpression: "#8e330 = :8e330",
    FilterExpression: "#8e331 = :8e331",
    ExpressionAttributeValues: {
      ":8e330": {
        S: "2"
      },
      ":8e331": {
        S: "user"
      }
    },
    ExpressionAttributeNames: {
      "#8e330": "userId",
      "#8e331": "type"
    }
  };
  try {
    const command = new QueryCommand(params)
    console.log(command)
    const response = await docClient.send(command);
    if (!response.Items || response.Items.length === 0) {
      return res.status(404).json({
        error: `User with userId ${userId} not found.`,
      });
    }
    res.status(200).json(response.Items);  // Return the first item found
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      error: 'Could not retrieve user',
    });
  }
});

// Update user by userId
router.put('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { name } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Bad Request. userId is required.' });
  }

  // Step 1: Query the user by userId using the GSI
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
    // Query the user
    const queryCommand = new QueryCommand(queryParams);
    const queryResult = await docClient.send(queryCommand);

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return res.status(404).json({ error: `User with userId ${userId} not found.` });
    }

    // Extract the `id` from the query result
    const user = queryResult.Items[0];
    const id = user.id.S; // Access the string value of id
console.log(id)
    // Step 2: Update the user using the retrieved id
    const updateParams = {
      TableName: "reservations-table-dev",
      Key: {
        'id': { S: id }, // Primary key for the update   
      },
      UpdateExpression: "SET #9cbf0 = :9cbf0",
      ExpressionAttributeValues: {
        ":9cbf0": { S: name }, // Updated name
        ":9cbf1": { S: "user" }, // Updated name

      },
      ExpressionAttributeNames: {
        "#9cbf0": "name",
        "#9cbf1": "type", // Updated name

      },
    };

    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
    let updateDocClient;
    if (process.env.IS_OFFLINE === 'true') {
      updateDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      }));
    } else {
      updateDocClient = DynamoDBDocumentClient.from(new DynamoDBClient());
    }
    
        // Execute the update command
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

module.exports = router;
