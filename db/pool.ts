import { Pool } from 'pg';

// Declare a constant for the Postgres ROLE
const postgresRole = 'hacc';

const pool = new Pool({
  user: postgresRole,
  host: process.env.TYPEORM_HOST,
  database: process.env.TYPEORM_USERNAME,
  password: (process.env.TYPEORM_PASSWORD as string),
  port: parseInt(process.env.TYPEORM_PORT as string, 10),
});

export default pool;
