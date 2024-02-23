'use strict';
const ApiDatabaseConnector = require('../src/modules/BD');
const validator = require('validator');
const deleteJob = async (event, context) => {
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
    const result = await connector.deleteJob(job_id);
    return {
      statusCode: result.status,
      body: result.message
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
  deleteJob
};