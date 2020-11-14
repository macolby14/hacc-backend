import { Pool } from 'pg';
// Declare a constant for the Postgres ROLE
const postgresRole = 'hacc';
const pool = new Pool({
    user: postgresRole,
    host: process.env.TYPEORM_HOST,
    database: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    port: parseInt(process.env.TYPEORM_PORT, 10),
});
export default pool;
//# sourceMappingURL=pool.js.map