import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';
import db from '../lib/db-client';
import { InventoryTable } from '@org/shared-types';

const BATCH_SIZE = 1000; // Process 1000 records at a time

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
  const csvFilePath = path.resolve(__dirname, '../../../../data/inventory.csv');
  
  try {
    // Count CSV rows first
    const totalRows = await countCsvRows(csvFilePath);
    console.log(`Total rows in CSV: ${totalRows}`);

    // Get initial count
    const initialCount = await db.selectFrom('inventory')
      .select(db.fn.count<string>('id').as('count'))
      .executeTakeFirst()
      .then(result => parseInt(result?.count as string || '0'));
    
    console.log(`Initial row count in database: ${initialCount}`);

    if (initialCount == totalRows) {
      console.log('Inventory already imported');
      return;
    }

    // Clear table if partially filled
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
    let batch: Omit<InventoryTable, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    for await (const record of parser) {
      batch.push({
        productNumber: record['Product Number'],
        material: record['Material'],
        form: record['Form'],
        choice: record['Choice'],
        grade: record['Grade'],
        finish: record['Finish'] || null,
        surface: record['Surface'] || null,
        quantity: parseInt(record['Quantity']),
        weight: parseFloat(record['Weight (t)']),
        length: record['Length (mm)'] ? parseFloat(record['Length (mm)']) : null,
        width: record['Width (mm)'] ? parseFloat(record['Width (mm)']) : null,
        height: record['Height (mm)'] ? parseFloat(record['Height (mm)']) : null,
        thickness: record['Thickness (mm)'] ? parseFloat(record['Thickness (mm)']) : null,
        outerDiameter: record['Outer Diameter (mm)'] ? parseFloat(record['Outer Diameter (mm)']) : null,
        wallThickness: record['Wall Thickness (mm)'] ? parseFloat(record['Wall Thickness (mm)']) : null,
        webThickness: record['Web Thickness (mm)'] ? parseFloat(record['Web Thickness (mm)']) : null,
        flangeThickness: record['Flange Thickness (mm)'] ? parseFloat(record['Flange Thickness (mm)']) : null,
        certificates: record['Certificates'] || null,
        location: record['Location'] || null,
      });

      processedCount++;

      // When batch is full or we've reached the end, insert the batch
      if (batch.length === BATCH_SIZE || processedCount === totalRows) {
        await db.insertInto('inventory')
          .values(batch)
          .execute();
        
        const currentPercentage = Math.floor((processedCount / totalRows) * 100);
        if (currentPercentage >= lastReportedPercentage + 1) {
          console.log(`Progress: ${currentPercentage}% (${processedCount} of ${totalRows} rows)`);
          lastReportedPercentage = currentPercentage;
        }
        
        batch = []; // Clear the batch after insertion
      }
    }

    // Get final count
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