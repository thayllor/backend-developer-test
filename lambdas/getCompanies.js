// handler.js
'use strict';
const ApiDatabaseConnector = require('../src/modules/BD');

module.exports.getCompanies = async (event) => {
  const connector = new ApiDatabaseConnector();
  try {
    const companies = await connector.getCompanies();
    return {
      statusCode: 200,
      body: JSON.stringify(companies),
    };
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    return {
      statusCode: 500,
      body: JSON.stringify('Server error'),
    };
  }
};