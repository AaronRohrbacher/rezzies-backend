
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const express = require("express");
const serverless = require("serverless-http");

const app = express();

const { auth } = require('express-oauth2-jwt-bearer');

const RESERVATIONS_TABLE = process.env.RESERVATIONS_TABLE;

// const port = process.env.PORT || 3000;

const jwtCheck = auth({
  audience: 'http://localhost:3000',
  issuerBaseURL: 'https://dev-dknrub66od10a3x7.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});

// enforce on all endpoints
// app.use(jwtCheck);

app.get('/authorized', jwtCheck, function (req, res) {
    res.send('Secured Resource');
});

// app.listen(port);

// console.log('Running on port ', port);


let client;
console.log(process.env.IS_OFFLINE)
if (process.env.IS_OFFLINE === 'true') {
  client = new DynamoDBClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
  });  
} else {
  client = new DynamoDBClient();
}
const docClient = DynamoDBDocumentClient.from(client);

app.use(express.json());

app.get("/users/:userId", async (req, res) => {
  const params = {
    TableName: RESERVATIONS_TABLE,
    Key: {
      id: req.params.id,
    },
  };

  try {
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    if (Item) {
      const { userId, name } = Item;
      res.json({ userId, name });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find user with provided "userId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve user" });
  }
});

app.post("/restaurants", async (req, res) => { 
  const { id, userId, restaurantId, restaurantName } = req.body;
  const params = {
    TableName: RESERVATIONS_TABLE,
    Item: { id, userId, restaurantId, restaurantName },
  };

  try {
    console.log(RESERVATIONS_TABLE)
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json("success");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create restaurant" });
  }
});



app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports = {
  handler: serverless(app), // Lambda handler
  app, // Express app
};
