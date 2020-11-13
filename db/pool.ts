import { Pool } from 'pg';

// Declare a constant for the Postgres ROLE
const postgresRole = 'hacc';

const pool = new Pool({
  user: postgresRole,
  host: 'localhost',
  database: 'hacc',
  password: 'hacc',
  port: 5432,
});

export default pool;
