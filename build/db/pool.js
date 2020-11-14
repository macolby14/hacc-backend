"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
// Declare a constant for the Postgres ROLE
const postgresRole = 'hacc';
const pool = new pg_1.Pool({
    user: postgresRole,
    host: process.env.TYPEORM_HOST,
    database: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    port: parseInt(process.env.TYPEORM_PORT, 10),
});
exports.default = pool;
//# sourceMappingURL=pool.js.map