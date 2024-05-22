# 🎉 Event Management System - Serverless

This project demonstrates how to develop a serverless backend for an event management system using AWS Lambda, DynamoDB, and SNS with the Serverless Framework. The backend is developed and tested locally using Localstack.

## 🚀 Project Setup

### Step 1: Install Node.js and Serverless Framework

Ensure you have Node.js installed. Then, install the Serverless Framework globally:

```console
    npm install -g serverless
```

### Step 2: Create a Serverless Project

Create a new Serverless project:

```console
    serverless create --template aws-nodejs --path event-management-system
    cd event-management-system
    npm init -y
    npm install aws-sdk jsonwebtoken bcryptjs serverless-offline serverless-localstack
```

## ⚙️ Configuration

### Step 3: Configure `serverless.yml`

Update your `serverless.yml` to configure DynamoDB and SNS locally using Localstack, and include serverless-offline for local API Gateway.

See the full `serverless.yml` configuration [here](serverless.yml).

## 📝 Lambda Functions

### Step 4: Create Lambda Functions

Create a `handler.js` file with the Lambda functions to handle the API endpoints. You can find the implementation details [here](handler.js).

## 🛠 Local Development

### Step 5: Start Localstack

Start Localstack:

```console
    localstack start
```

Create DynamoDB Table and SNS Topic Locally:

```bash
    aws --endpoint-url=http://localhost:4566 dynamodb create-table --table-name event-management-system-events --attribute-definitions AttributeName=id,AttributeType=S --key-schema AttributeName=id,KeyType=HASH --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 --region us-east-1

    aws --endpoint-url=http://localhost:4566 sns create-topic --name eventNotification --region us-east-1
```

### Step 6: Start Serverless Offline

Start the Serverless Offline plugin to run the API locally:

```console
    serverless offline --stage local
```

### Step 7: Test Locally

Use Postman or curl to test the endpoints locally:

#### 🚀 Create Event:

```bash
    curl -X POST http://localhost:3000/events -H "Content-Type: application/json" -H "Authorization: Bearer <your-token>" -d '{"title":"Sample Event","description":"This is a sample event.","date":"2024-05-20"}'
```

#### 📋 Get All Events:

```bash
    curl http://localhost:3000/local/events
```

#### 🔍 Get Event by ID:

```bash
    curl http://localhost:3000/local/events/{id}
```

#### ✏️ Update Event:

```bash
    curl -X PUT http://localhost:3000/local/events/{id} -H "Content-Type: application/json" -d '{"title":"Updated Event","description":"This is an updated event.","date":"2024-06-20"}'
```

#### ❌ Delete Event:

```bash
    curl -X DELETE http://localhost:3000/local/events/{id}
```

### 🕰 Invoke Hourly Task Manually:

```bash
    serverless invoke local --function hourlyTask
```

### 📡 Publish a Message to SNS Topic:

```bash
    aws --endpoint-url=http://localhost:4566 sns publish --topic-arn arn:aws:sns:us-east-1:000000000000:eventNotification --message "Test SNS message" --region us-east-1
```