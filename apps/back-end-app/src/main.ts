import express from 'express';
import cors from 'cors';
import { getInventoryStats, getInventory } from './lib/db-client';

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

app.listen(port, () => {
  console.log(`[ ready ] http://localhost:${port}`);
});
