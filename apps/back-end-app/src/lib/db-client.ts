import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from '@org/shared-types';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: __dirname + '/../../.env' });

// Create the Kysely database instance
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

export interface InventoryStats {
  totalItems: number;
  totalVolume: number;
}

export interface PaginatedInventory {
  data: Database['inventory'][];
  total: number;
}

export async function getInventoryStats(): Promise<InventoryStats> {
  const totalItems = await db
    .selectFrom('inventory')
    .select(({ fn }) => [
      fn.count('id').as('total')
    ])
    .executeTakeFirst();

  const totalVolume = await db
    .selectFrom('inventory')
    .select(({ fn }) => [
      fn.sum('weight_t').as('totalWeight')
    ])
    .executeTakeFirst();

  return {
    totalItems: Number(totalItems?.total) || 0,
    totalVolume: Number(totalVolume?.totalWeight) || 0
  };
}

export async function getInventory(
  page = 1,
  pageSize = 10,
  sortOrder?: string
): Promise<PaginatedInventory> {
  const offset = (page - 1) * pageSize;

  let query = db.selectFrom('inventory');
  if (sortOrder === undefined) {
    query = query.orderBy('weight_t', 'desc');
  } else if (sortOrder === 'asc' || sortOrder === 'desc') {
    query = query
      .orderBy('form', sortOrder)
      .orderBy('choice', sortOrder)
      .orderBy('weight_t', 'desc');
  } else {
    throw new Error('Invalid sort order');
  }

  const [inventory, totalCount] = await Promise.all([
    query
      .selectAll()
      .limit(pageSize)
      .offset(offset)
      .execute(),
    db
      .selectFrom('inventory')
      .select(({ fn }) => [
        fn.count('id').as('total')
      ])
      .executeTakeFirst()
  ]);

  return {
    data: inventory,
    total: Number(totalCount?.total) || 0
  };
}

export default db; 