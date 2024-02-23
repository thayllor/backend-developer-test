// getCompanyById.js
'use strict';
const ApiDatabaseConnector = require('../src/modules/BD');
const validator = require('validator');

module.exports.getCompanyById = async (event) => {
  const { company_id } = event.pathParameters;
  // Check if company_id is a valid UUID
  if (!validator.isUUID(company_id)) {
    return {
      statusCode: 400,
      body: JSON.stringify('Invalid company_id: must be a valid UUID'),
    };
  }

  const connector = new ApiDatabaseConnector();
  try {
    const company = await connector.getCompanyById(company_id);
    if (company) {
      return {
        statusCode: 200,
        body: JSON.stringify(company),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify('Company not found'),
      };
    }
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    return {
      statusCode: 500,
      body: JSON.stringify('Server error'),
    };
  }
};