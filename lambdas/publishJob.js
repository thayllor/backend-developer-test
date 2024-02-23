'use strict';
const ApiDatabaseConnector = require('../src/modules/BD');
const validator = require('validator');

const publishJob = async (event) => {

  if (!event.pathParameters || !event.pathParameters.job_id) {
    return {
      statusCode: 400,
      body: 'Missing job_id parameter'
    };
  }

  const { job_id } = event.pathParameters;
  const connector = new ApiDatabaseConnector();

  // Check if job_id is a valid UUID
  if (!validator.isUUID(job_id)) {
    return {
      statusCode: 400,
      body: 'Invalid job_id: must be a valid UUID'
    };
  }

  try {
    const publishedJob = await connector.publishJobDraft(job_id);
    if (publishedJob) {
      return {
        statusCode: 200,
        body: JSON.stringify(publishedJob)
      };
    } else {
      return {
        statusCode: 404,
        body: 'Job not found'
      };
    }
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    return {
      statusCode: 500,
      body: 'Server error'
    };
  }
};

module.exports = {
  publishJob
};