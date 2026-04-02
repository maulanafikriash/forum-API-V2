import pkg from 'pg';
import config from '../../../Commons/config.js';

const { Pool } = pkg;

const pool = config.database.url
  ? new Pool({
    connectionString: config.database.url,
    ssl: config.database.ssl,
  })
  : new Pool({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
  });

export default pool;
