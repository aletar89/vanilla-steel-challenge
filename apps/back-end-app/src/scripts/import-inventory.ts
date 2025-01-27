import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function importInventory() {
  const csvFilePath = path.resolve(__dirname, '../../../../data/inventory.csv');
  
  try {
    // Get initial count
    const initialCount = await prisma.inventory.count();
    console.log(`Initial row count: ${initialCount}`);


    if (initialCount >= 11650) {
      console.log('Inventory already imported');
      return;
    }

    const parser = fs
      .createReadStream(csvFilePath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true
      }));

    for await (const record of parser) {
      await prisma.inventory.create({
        data: {
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
        },
      });
    }

    // Get final count
    const finalCount = await prisma.inventory.count();
    console.log(`Import completed successfully`);
    console.log(`Rows added: ${finalCount - initialCount}`);
    console.log(`Final row count: ${finalCount}`);

  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importInventory(); 