import express from 'express';
import cors from 'cors';
import { getInventoryStats, getInventory, insertPreferences, findMatchingInventory } from './lib/db-client';
import multer from 'multer';
import { parse } from 'csv-parse';
import { Readable } from 'stream';
import { PreferenceRow} from '@org/shared-types';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://vanilla-steel-challenge-frontend.onrender.com'
    : 'http://localhost:4200',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Add multer for file upload handling
const upload = multer({ storage: multer.memoryStorage() });

// API routes
app.get('/api/inventory/stats', async (req, res) => {
  try {
    const stats = await getInventoryStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({ error: 'Failed to fetch inventory statistics' });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const formChoiseSortOrder = req.query.formChoiseSortOrder?.toString();

    const result = await getInventory(page, pageSize, formChoiseSortOrder);
    res.json(result);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: error.message });
  
  }
});

app.post('/api/upload-csv', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const preferences: Omit<PreferenceRow, 'id'>[] = [];
    const parser = parse({
      columns: true,
      skip_empty_lines: true
    });

    // Create a readable stream from the buffer
    const stream = Readable.from(req.file.buffer.toString());
    const filename = req.file?.originalname || 'no_name.csv';
    const timestamp = new Date().toISOString();
    // Process the CSV data and collect all preferences
    await new Promise<void>((resolve, reject) => {
      stream.pipe(parser)
        .on('data', (record: any) => {
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

    // Insert preferences into database
    await insertPreferences(preferences);

    // Find matching inventory items
    const matches = await findMatchingInventory(filename, timestamp);

    res.json({ data: matches });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

app.listen(port, () => {
  console.log(`[ ready ] http://localhost:${port}`);
});
