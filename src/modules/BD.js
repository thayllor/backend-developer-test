const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

class ApiDatabaseConnector {
  constructor() {
    if(process.env.ENVIROMENT ==="AWS"){
      this.pool = new Pool({
        host: process.env.AWS_DB_HOST,
        port: process.env.AWS_DB_PORT,
        user: process.env.AWS_DB_USER,
        password: process.env.AWS_DB_PASSWORD,
        database: process.env.AWS_DB_NAME,
        ssl: {
          rejectUnauthorized: true,
          ca: fs.readFileSync('./src/certificate/us-east-2-bundle.pem').toString(),
        }
      });
    }else{
      this.pool = new Pool({
        host: process.env.LOCAL_DB_HOST,
        port: process.env.LOCAL_DB_PORT,
        user: process.env.LOCAL_DB_USER,
        password: process.env.LOCAL_DB_PASSWORD,
        database: process.env.LOCAL_DB_NAME,
      });
    }
  }

  async getCompanies() {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM companies');
      return rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async getCompanyById(company_id) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM companies WHERE id = $1', [company_id]);
      if (rows.length > 0) {
        return rows[0];
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async getJobsByStatus(status) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query('SELECT id, title, description, company_id as companyName, created_at as createdAt FROM jobs WHERE status = $1', [status]);
      return rows;
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async createJobDraft(jobDetails) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query('INSERT INTO jobs (title, description, company_id, location, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *', [jobDetails.title, jobDetails.description, jobDetails.company_id, jobDetails.location, jobDetails.notes]);
      return rows[0];
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async publishJobDraft(job_id) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query('UPDATE jobs SET status = \'published\' WHERE id = $1 RETURNING *', [job_id]);
      if (rows.length > 0) {
        return rows[0];
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async editJobDraft(job_id, jobDetails) {
    const client = await this.pool.connect();
    try {
        // Start building the query
        let query = 'UPDATE jobs SET ';
        let params = [];
        let index = 1;

        // Add each property in jobDetails to the query
        for (let prop in jobDetails) {
          if (jobDetails.hasOwnProperty(prop)) {
            query += `${prop} = $${index}, `;
            params.push(jobDetails[prop]);
            index++;
            console.log(prop)
          }
        }

        // Remove the last comma and space from the query
        query = query.slice(0, -2);

        // Add the WHERE clause to the query
        query += ` WHERE id = $${index} RETURNING *`;
        params.push(job_id);

        const { rows } = await client.query(query, params);
        if (rows.length > 0) {
          return rows[0];
        } else {
          return null;
        }
      } catch (error) {
        throw error;
      } finally {
        client.release();

    }
  }

  async archiveJob(job_id) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query('UPDATE jobs SET status = \'archived\' WHERE id = $1 RETURNING *', [job_id]);
      if (rows.length > 0) {
        return rows[0];
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteJob(job_id) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query('SELECT status FROM jobs WHERE id = $1', [job_id]);

      if (rows.length === 0) {
        return { status: 404, message: 'Job not found' };
      } else if (rows[0].status !== 'draft') {
        return { status: 400, message: 'Only draft jobs can be deleted' };
      } else {
        await client.query('DELETE FROM jobs WHERE id = $1', [job_id]);
        await client.query('COMMIT');
        return { status: 200, message: 'Job deleted successfully' };
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

}
module.exports = ApiDatabaseConnector;