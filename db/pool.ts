import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.RDS_USERNAME,
  host: process.env.RDS_HOSTNAME,
  database: process.env.RDS_DB_NAME,
  password: (process.env.RDS_PASSWORD as string),
  port: parseInt(process.env.RDS_PORT as string, 10),
});

export default pool;
