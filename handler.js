const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");

const express = require("express");
const serverless = require("serverless-http");

const app = express();

const RESERVATIONS_TABLE = process.env.RESERVATIONS_TABLE;

let client;
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

app.post("/users", async (req, res) => {
  const { id, name } = req.body;
  if (typeof id !== "string") {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof name !== "string") {
    res.status(400).json({ error: '"name" must be a string' });
  }
  debugger;
  const params = {
    TableName: RESERVATIONS_TABLE,
    Item: { id, name },
  };

  try {
    console.log(RESERVATIONS_TABLE)
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json({ id, name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create user" });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

exports.handler = serverless(app);
