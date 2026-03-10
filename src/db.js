import pg from 'pg';

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: 'bucketsai',
  user: 'postgres',
  password: 'postgres',
});

export default pool;
