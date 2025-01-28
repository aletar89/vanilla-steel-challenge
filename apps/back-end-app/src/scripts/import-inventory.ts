import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';
import db from '../lib/db-client';
import { InventoryRow } from '@org/shared-types';

const BATCH_SIZE = 1000; 

async function ensureInventoryTable() {
  try {
    const tableExists = await db.selectFrom('inventory')
      .select('id')
      .limit(1)
      .execute()
      .then(() => true)
      .catch(() => false);

    if (!tableExists) {
      console.log('Creating inventory table...');
      await db.schema
        .createTable('inventory')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('product_number', 'varchar(255)', col => col.notNull())
        .addColumn('material', 'varchar(255)', col => col.notNull())
        .addColumn('form', 'varchar(255)', col => col.notNull())
        .addColumn('choice', 'varchar(255)', col => col.notNull())
        .addColumn('grade', 'varchar(255)', col => col.notNull())
        .addColumn('finish', 'varchar(255)')
        .addColumn('surface', 'varchar(255)')
        .addColumn('quantity', 'integer', col => col.notNull())
        .addColumn('weight_t', 'numeric', col => col.notNull())
        .addColumn('length_mm', 'numeric')
        .addColumn('width_mm', 'numeric')
        .addColumn('height_mm', 'numeric')
        .addColumn('thickness_mm', 'numeric')
        .addColumn('outer_diameter_mm', 'numeric')
        .addColumn('wall_thickness_mm', 'numeric')
        .addColumn('web_thickness_mm', 'numeric')
        .addColumn('flange_thickness_mm', 'numeric')
        .addColumn('certificates', 'varchar(255)')
        .addColumn('location', 'varchar(255)')
        .execute();
      console.log('Inventory table created successfully');
    } else {
      console.log('Inventory table already exists');
    }
  } catch (error) {
    console.error('Error ensuring inventory table:', error);
    throw error;
  }
}

async function ensurePreferencesTable() {
  try {
    const tableExists = await db.selectFrom('preferences')
      .select('id')
      .limit(1)
      .execute()
      .then(() => true)
      .catch(() => false);

    if (tableExists) {
      console.log('Dropping existing preferences table...');
      await db.schema
        .dropTable('preferences')
        .execute();
      console.log('Preferences table dropped successfully');
    }

    console.log('Creating preferences table...');
    await db.schema
      .createTable('preferences')
      .addColumn('id', 'serial', col => col.primaryKey())
      .addColumn('filename', 'varchar(255)', col => col.notNull())
      .addColumn('timestamp', 'timestamptz', col => col.notNull())
      .addColumn('material', 'varchar(255)', col => col.notNull())
      .addColumn('form', 'varchar(255)', col => col.notNull())
      .addColumn('grade', 'varchar(255)', col => col.notNull())
      .addColumn('choice', 'varchar(255)')
      .addColumn('min_width', 'numeric')
      .addColumn('max_width', 'numeric')
      .addColumn('min_thickness', 'numeric')
      .addColumn('max_thickness', 'numeric')
      .execute();
    console.log('Preferences table created successfully');
  } catch (error) {
    console.error('Error ensuring preferences table:', error);
    throw error;
  }
}

async function countCsvRows(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let rowCount = 0;
    fs.createReadStream(filePath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true
      }))
      .on('data', () => rowCount++)
      .on('end', () => resolve(rowCount))
      .on('error', reject);
  });
}

async function importInventory() {
  try {
    await ensureInventoryTable();
    await ensurePreferencesTable();
    
    const csvFilePath = path.resolve(__dirname, '../../../../data/inventory.csv');
    
    const totalRows = await countCsvRows(csvFilePath);
    console.log(`Total rows in CSV: ${totalRows}`);

    const initialCount = await db.selectFrom('inventory')
      .select(db.fn.count<string>('id').as('count'))
      .executeTakeFirst()
      .then(result => parseInt(result?.count as string || '0'));
    
    console.log(`Initial row count in database: ${initialCount}`);

    if (initialCount == totalRows) {
      console.log('Inventory already imported');
      return;
    }

    if (initialCount > 0) {
      console.log('Table is partially filled. Clearing existing records...');
      await db.deleteFrom('inventory').execute();
      console.log('Table cleared successfully');
    }

    const parser = fs
      .createReadStream(csvFilePath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true
      }));

    let processedCount = 0;
    let lastReportedPercentage = 0;
    let batch: Omit<InventoryRow, 'id'>[] = [];

    for await (const record of parser) {
      batch.push({
        product_number: record['Product Number'],
        material: record['Material'],
        form: record['Form'],
        choice: record['Choice'],
        grade: record['Grade'],
        finish: record['Finish'] || null,
        surface: record['Surface'] || null,
        quantity: parseInt(record['Quantity']),
        weight_t: parseFloat(record['Weight (t)']),
        length_mm: record['Length (mm)'] ? parseFloat(record['Length (mm)']) : null,
        width_mm: record['Width (mm)'] ? parseFloat(record['Width (mm)']) : null,
        height_mm: record['Height (mm)'] ? parseFloat(record['Height (mm)']) : null,
        thickness_mm: record['Thickness (mm)'] ? parseFloat(record['Thickness (mm)']) : null,
        outer_diameter_mm: record['Outer Diameter (mm)'] ? parseFloat(record['Outer Diameter (mm)']) : null,
        wall_thickness_mm: record['Wall Thickness (mm)'] ? parseFloat(record['Wall Thickness (mm)']) : null,
        web_thickness_mm: record['Web Thickness (mm)'] ? parseFloat(record['Web Thickness (mm)']) : null,
        flange_thickness_mm: record['Flange Thickness (mm)'] ? parseFloat(record['Flange Thickness (mm)']) : null,
        certificates: record['Certificates'] || null,
        location: record['Location'] || null,
      });

      processedCount++;

      if (batch.length === BATCH_SIZE || processedCount === totalRows) {
        await db.insertInto('inventory')
          .values(batch)
          .execute();
        
        const currentPercentage = Math.floor((processedCount / totalRows) * 100);
        if (currentPercentage >= lastReportedPercentage + 1) {
          console.log(`Progress: ${currentPercentage}% (${processedCount} of ${totalRows} rows)`);
          lastReportedPercentage = currentPercentage;
        }
        
        batch = [];
      }
    }

    const finalCount = await db.selectFrom('inventory')
      .select(db.fn.count<string>('id').as('count'))
      .executeTakeFirst()
      .then(result => parseInt(result?.count as string || '0'));

    console.log(`Import completed successfully`);
    console.log(`Rows added: ${finalCount - initialCount}`);
    console.log(`Final row count: ${finalCount}`);

  } catch (error) {
    console.error('Error importing data:', error);
  }
}

importInventory(); 