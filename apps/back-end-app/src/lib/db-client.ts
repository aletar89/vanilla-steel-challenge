import { Kysely, PostgresDialect} from 'kysely';
import { Pool } from 'pg';
import { Database, InventoryStatsType, PaginatedInventory, PreferenceRow, PreferenceMatchRow } from '@org/shared-types';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/../../.env' });

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10, 
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: {
        rejectUnauthorized: false 
      }
    }),
  }),
});


export async function getInventoryStats(): Promise<InventoryStatsType> {
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

export async function insertPreferences(preferences: Omit<PreferenceRow, 'id'>[]): Promise<void> {
  await db.insertInto('preferences')
    .values(preferences)
    .execute();
}

export async function findMatchingInventory(filename: string, timestamp: string): Promise<PreferenceMatchRow[]> {
  const query = db
    .selectFrom('inventory')
    .innerJoin('preferences', join => join
      .on('preferences.filename', '=', filename)
      .on('preferences.timestamp', '=', timestamp)
      .onRef('preferences.material', '=', 'inventory.material')
      .onRef('preferences.form', '=', 'inventory.form')
      .onRef('preferences.grade', '=', 'inventory.grade')
      .on((eb) => 
        eb('preferences.choice', 'is', null)
        .or('preferences.choice', '=', '')
        .or('preferences.choice', '=', eb.ref('inventory.choice'))
      )
      .on((eb) => 
        eb('preferences.min_width', '=', null)
        .or('inventory.width_mm', '>=', eb.ref('preferences.min_width'))
      )
      .on((eb) =>
        eb('preferences.max_width', 'is', null)
        .or('inventory.width_mm', '<=', eb.ref('preferences.max_width'))
      )
      .on((eb) =>
        eb('preferences.min_thickness', 'is', null)
        .or('inventory.thickness_mm', '>=', eb.ref('preferences.min_thickness'))
      )
      .on((eb) =>
        eb('preferences.max_thickness', 'is', null)
        .or('inventory.thickness_mm', '<=', eb.ref('preferences.max_thickness'))
      )
    )
    .where('inventory.weight_t', '>', 10)
    .select([
      'inventory.product_number',
      'inventory.material',
      'inventory.form',
      'inventory.choice',
      'inventory.grade',
      'inventory.weight_t',
      'inventory.length_mm',
      'inventory.width_mm',
      'inventory.height_mm',
      'inventory.thickness_mm',
      'inventory.outer_diameter_mm',
      'inventory.wall_thickness_mm',
      'inventory.web_thickness_mm',
      'inventory.flange_thickness_mm'
    ])
    .distinct();
  const result = await query.execute();
  return result;
}

export default db; 