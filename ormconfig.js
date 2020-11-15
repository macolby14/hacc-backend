module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  logging: true,
  entities: process.env.NODE_ENV === 'production' ? ['build/entity/*.js'] : ['./entity/*.ts'],
// TYPEORM_ENTITIES:
};
