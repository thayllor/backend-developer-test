const { Pool } = require('pg');
require('dotenv').config();

class ApiDatabaseConnector {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
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

  async createJobDraft(jobDetails) {
    const client = await this.pool.connect();
    try {
      const { rows } = await client.query('INSERT INTO jobs (title, description, company_id) VALUES ($1, $2, $3) RETURNING *', [jobDetails.title, jobDetails.description, jobDetails.company_id]);
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
      const { rows } = await client.query('UPDATE jobs SET title = $1, location = $2, description = $3 WHERE id = $4 RETURNING *', [jobDetails.title, jobDetails.location, jobDetails.description, job_id]);
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