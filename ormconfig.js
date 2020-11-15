module.exports = {
  type: 'postgres',
  host: process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT,
  username: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
  synchronize: true,
  logging: true,
  entities: process.env.NODE_ENV === 'production' ? ['build/entity/*.js'] : ['./entity/*.ts'],
// TYPEORM_ENTITIES:
};
