'use strict';
require('dotenv').config();
const AWS = require('aws-sdk');
const ApiDatabaseConnector = require('../src/modules/BD');
const s3 = new AWS.S3();

const updateFeed = async (event, context) => {
  const connector = new ApiDatabaseConnector();

  try {
    const jobs = await connector.getJobsByStatus('published');
    const feed = JSON.stringify(jobs);

    const params = {
      Bucket: pross.env.BUCKET_NAME,
      Key: 'feed.json',
      Body: feed,
      ContentType: 'application/json'
    };

    await s3.putObject(params).promise();

    return {
      statusCode: 200,
      body: 'Feed updated successfully'
    };
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    return {
      statusCode: 500,
      body: 'Server error'
    };
  }
};

module.exports = {
  updateFeed
};