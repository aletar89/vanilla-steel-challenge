import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { PreferenceRow } from '@org/shared-types';


export async function parsePreferencesFromCsv(
  fileBuffer: Buffer,
  filename: string,
  timestamp: string
): Promise<Omit<PreferenceRow, 'id'>[]> {
  const preferences: Omit<PreferenceRow, 'id'>[] = [];
  const parser = parse({
    columns: true,
    skip_empty_lines: true
  });

  const stream = Readable.from(fileBuffer.toString());

  await new Promise<void>((resolve, reject) => {
    stream.pipe(parser)
      .on('data', (record: Record<string, string>) => {
        // Skip lines where all values are empty/null
        if (Object.values(record).every(value => !value)) {
          return;
        }
        preferences.push({
          filename: filename,
          timestamp: timestamp,
          material: record['Material'],
          form: record['Form'],
          grade: record['Grade'],
          choice: record['Choice'],
          min_width: record['Width (Min)'] ? parseFloat(record['Width (Min)']) : null,
          max_width: record['Width (Max)'] ? parseFloat(record['Width (Max)']) : null,
          min_thickness: record['Thickness (Min)'] ? parseFloat(record['Thickness (Min)']) : null,
          max_thickness: record['Thickness (Max)'] ? parseFloat(record['Thickness (Max)']) : null
        });
      })
      .on('end', () => resolve())
      .on('error', reject);
  });

  return preferences;
} 