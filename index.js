
const express = require("express");
const ApiDatabaseConnector = require('./modules/BD');

const app = express();
const port = process.env.PORT || 3000;










app.use(express.json());

app.get('/', async (req, res) => {
  res.status(200).send('Server ok');
});


// - `GET /companies`: List existing companies.
app.get('/companies', async (req, res) => {
  const connector = new ApiDatabaseConnector();

  try {
    const companies = await connector.getCompanies();
    res.status(200).json(companies);
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    res.status(500).send('Server error');
  }
});

// - `GET /companies/:company_id`: Fetch a specific company by ID.
app.get('/companies/:company_id', async (req, res) => {
  const { company_id } = req.params;
  const connector = new ApiDatabaseConnector();

  try {
    const company = await connector.getCompanyById(company_id);
    if (company) {
      res.status(200).json(company);
    } else {
      res.status(404).send('Company not found');
    }
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    res.status(500).send('Server error');
  }
});

// - `POST /job`: Create a job posting draft.
app.post('/job', async (req, res) => {
  const jobDetails = req.body;
  const connector = new ApiDatabaseConnector();

  try {
    const jobDraft = await connector.createJobDraft(jobDetails);
    res.status(201).json(jobDraft);
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    res.status(500).send('Server error');
  }
});

// - `PUT /job/:job_id/publish`: Publish a job posting draft.
app.put('/job/:job_id/publish', async (req, res) => {
  const { job_id } = req.params;
  const connector = new ApiDatabaseConnector();

  try {
    const publishedJob = await connector.publishJobDraft(job_id);
    if (publishedJob) {
      res.status(200).json(publishedJob);
    } else {
      res.status(404).send('Job not found');
    }
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    res.status(500).send('Server error');
  }
});

// - `PUT /job/:job_id`: Edit a job posting draft (title, location, description).
app.put('/job/:job_id', async (req, res) => {
  const { job_id } = req.params;
  const jobDetails = req.body;
  const connector = new ApiDatabaseConnector();

  try {
    const updatedJob = await connector.editJobDraft(job_id, jobDetails);
    if (updatedJob) {
      res.status(200).json(updatedJob);
    } else {
      res.status(404).send('Job not found');
    }
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    res.status(500).send('Server error');
  }
});

// - `PUT /job/:job_id/archive`: Archive an active job posting.
app.put('/job/:job_id/archive', async (req, res) => {
  const { job_id } = req.params;
  const connector = new ApiDatabaseConnector();

  try {
    const archivedJob = await connector.archiveJob(job_id);
    if (archivedJob) {
      res.status(200).json(archivedJob);
    } else {
      res.status(404).send('Job not found');
    }
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    res.status(500).send('Server error');
  }
});

// - `DELETE /job/:job_id`: Delete a job posting draft.
app.delete('/job/:job_id', async (req, res) => {
  const { job_id } = req.params;
  const connector = new ApiDatabaseConnector();

  try {
    const result = await connector.deleteJob(job_id);
    res.status(result.status).send(result.message);
  } catch (error) {
    console.error(`Error processing request: ${error}`);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
