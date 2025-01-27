import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from '@org/shared-types';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: __dirname + '/../../.env' });

// Create the Kysely database instance
console.log(process.env.DATABASE_URL);
const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 10000, // How long to wait for a connection
      ssl: {
        rejectUnauthorized: false // Required for some cloud database providers
      }
    }),
  }),
});

export default db; 