'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const docClient = new AWS.DynamoDB.DocumentClient({
  endpoint: 'http://localhost:4566', // Local DynamoDB endpoint
  region: 'us-east-1'
});

const TABLE_NAME = process.env.EVENTS_TABLE;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to validate JWT
const authenticateJWT = (event) => {
  const token = event.headers.Authorization || event.headers.authorization;
  if (!token) {
    throw new Error('No token provided');
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Unauthorized');
  }
};

// Create Event
module.exports.createEvent = async (event) => {
  try {
    const user = authenticateJWT(event); // Validate the token
    const { title, description, date } = JSON.parse(event.body);
    const id = uuid.v4();
    const newEvent = { id, title, description, date };
    await docClient.put({
      TableName: TABLE_NAME,
      Item: newEvent
    }).promise();

    // Auto-invoke sendEventSummary after creating an event
    await module.exports.sendEventSummary();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Event created', event: newEvent, user })
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: error.message })
    };
  }
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

// Send Event Summary
module.exports.sendEventSummary = async () => {
  // Fetch upcoming events from the database
  const data = await docClient.scan({ TableName: TABLE_NAME }).promise();
  // Compose email content
  const emailContent = `Upcoming Events:\n\n${data.Items.map(event => `${event.title} - ${event.date}`).join('\n')}`;
  // Mock sending email
  console.log('Sending email with content:', emailContent);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Event summary sent successfully' })
  };
};

// Hourly Task
module.exports.hourlyTask = async () => {
  console.log('Hourly task running...');
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hourly task executed successfully' })
  };
};

// Handle SNS Notification
module.exports.handleSnsNotification = async (event) => {
  for (const record of event.Records) {
    const snsMessage = record.Sns.Message;
    console.log('SNS Message:', snsMessage);
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'SNS notification processed successfully' })
  };
};
