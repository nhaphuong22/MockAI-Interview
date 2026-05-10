import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || 2),
      max: parseInt(process.env.DB_POOL_MAX || 10)
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
      extension: 'js'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
