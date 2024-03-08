import pkg from 'pg';

const pool = new pkg.Pool({
  user: 'stift',
  host: 'localhost',
  database: 'postgres',
  password: 'stiftdb',
  port: 5432,
});

export default pool;