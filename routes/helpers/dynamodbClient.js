const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

let docClient;
if (process.env.IS_OFFLINE === 'true') {
  docClient = DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    })
  );
} else {
  docClient = DynamoDBDocumentClient.from(new DynamoDBClient());
}

module.exports = docClient;
