'use strict';
const ApiDatabaseConnector = require('../src/modules/BD');
const validator = require('validator');
const createJob = async (event) => {

  const { title, description, company_id, location, notes } = JSON.parse(event.body);

  // Check if request body is empty
  if (!event.body) {
    return {
      statusCode: 400,
      body: 'Request body cannot be empty'
    };
  }

  // Check if required parameters are provided
  if (!title || !description || !company_id || !location) {
    return {
      statusCode: 400,
      body: 'Missing required parameters: title, description, company_id, location, notes'
    };
  }

  // Check if company_id is a valid UUID
  if (!validator.isUUID(company_id)) {
    return {
      statusCode: 400,
      body: 'Invalid company_id: must be a valid UUID'
    };
  }

  const jobDetails = { title, description, company_id, location, notes };
  const connector = new ApiDatabaseConnector();

  try {
    const jobDraft = await connector.createJobDraft(jobDetails);
    return {
      statusCode: 201,
      body: JSON.stringify(jobDraft)
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
  createJob
};