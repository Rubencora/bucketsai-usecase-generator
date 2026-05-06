import pg from 'pg';

const pool = process.env.DATABASE_URL
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL })
  : new pg.Pool({
      host: 'localhost',
      port: parseInt(process.env.DB_PORT || '5433'),
      database: 'bucketsai',
      user: 'postgres',
      password: 'postgres',
    });

export default pool;
