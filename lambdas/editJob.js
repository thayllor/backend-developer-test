'use strict';
const ApiDatabaseConnector = require('../src/modules/BD');
const validator = require('validator');
const editJob = async (event, context) => {

  const { job_id } = event.pathParameters;
  const jobDetails = JSON.parse(event.body);
  const validProperties = ['title', 'description', 'location', 'notes'];

  // Check if request body is empty
  if (!event.body) {
    return {
      statusCode: 400,
      body: 'Request body cannot be empty'
    };
  }

  // Check if job_id is a valid UUID
  if (!validator.isUUID(job_id)) {
    return {
      statusCode: 400,
      body: 'Invalid job_id: must be a valid UUID'
    };
  }

  // Check if request body contains only valid properties
  for (let prop in jobDetails) {
    if (!validProperties.includes(prop)) {
      return {
        statusCode: 400,
        body: `Invalid property: ${prop}`
      };
    }
  }

  const connector = new ApiDatabaseConnector();

  try {
    const updatedJob = await connector.editJobDraft(job_id, jobDetails);
    if (updatedJob) {
      return {
        statusCode: 200,
        body: JSON.stringify(updatedJob)
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
  editJob
};