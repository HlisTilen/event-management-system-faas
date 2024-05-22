'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');

const docClient = new AWS.DynamoDB.DocumentClient({
  endpoint: 'http://localhost:4566', // Localstack DynamoDB endpoint
  region: 'us-east-1'
});

const TABLE_NAME = process.env.EVENTS_TABLE;

// Create Event
module.exports.createEvent = async (event) => {
  const { title, description, date } = JSON.parse(event.body);
  const id = uuid.v4();
  const newEvent = { id, title, description, date };
  await docClient.put({
    TableName: TABLE_NAME,
    Item: newEvent
  }).promise();
  return {
    statusCode: 201,
    body: JSON.stringify(newEvent)
  };
};

// Get All Events
module.exports.getEvents = async () => {
  const data = await docClient.scan({ TableName: TABLE_NAME }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(data.Items)
  };
};

// Get Event by ID
module.exports.getEventById = async (event) => {
  const { id } = event.pathParameters;
  const data = await docClient.get({
    TableName: TABLE_NAME,
    Key: { id }
  }).promise();
  if (!data.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Event not found' })
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(data.Item)
  };
};

// Update Event
module.exports.updateEvent = async (event) => {
  const { id } = event.pathParameters;
  const { title, description, date } = JSON.parse(event.body);
  await docClient.update({
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set title = :title, description = :description, date = :date',
    ExpressionAttributeValues: {
      ':title': title,
      ':description': description,
      ':date': date
    }
  }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({ id, title, description, date })
  };
};

// Delete Event
module.exports.deleteEvent = async (event) => {
  const { id } = event.pathParameters;
  await docClient.delete({
    TableName: TABLE_NAME,
    Key: { id }
  }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Event deleted successfully' })
  };
};