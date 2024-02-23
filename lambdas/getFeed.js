'use strict';
require('dotenv').config();
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

let cachedJobs = null;

const getFeed = async (event, context) => {
  if (cachedJobs) {
    return {
      statusCode: 200,
      body: JSON.stringify(cachedJobs)
    };
  }
  const params = {
    Bucket: prosess.env.BUCKET_NAME,
    Key: 'feed.json'
  };

  try {
    const s3Data = await s3.getObject(params).promise();
    const jobs = JSON.parse(s3Data.Body.toString('utf-8'));

    const filteredJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      companyname: job.companyname,
      createdat: job.createdat
    }));

    cachedJobs = filteredJobs;
    return {
      statusCode: 200,
      body: JSON.stringify(filteredJobs)
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
  getFeed
};