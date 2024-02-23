const serverless = require("serverless-http");
const express = require("express");
const fs = require('fs');
const path = require('path');
const app = express();

const port = process.env.PORT || 3000;


const lambdas = {};

fs.readdirSync("./lambdas").forEach(file => {
  const moduleName = path.basename(file, '.js');
  lambdas[moduleName] = require(`./lambdas/${file}`);
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

app.get('/', async (req, res) => {
  res.status(200).send('Api ok');
});

// List existing companies.
app.get('/companies',lambdas.getCompanies);

// Fetch a specific company by ID.
app.get('/companies/:company_id',lambdas.getCompanyById);

//Create a job posting draft.
app.post('/job',lambdas.createJob);

// Publish a job posting draft.
app.put('/job/:job_id/publish',lambdas.publishJob);

// Edit a job posting draft (title, location, description).
app.put('/job/:job_id',lambdas.editJob);

// Archive an active job posting.
app.put('/job/:job_id/archive',lambdas.archiveJob);

// Delete a job posting draft.
app.delete('/job/:job_id',lambdas.deleteJob);


app.get('/feed',lambdas.getFeed);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports.handler = serverless(app);
