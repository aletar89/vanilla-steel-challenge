import express from 'express';
import cors from 'cors';
import db from './lib/db-client';

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
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await db
      .selectFrom('inventory')
      .selectAll()
      .limit(10)
      .execute();
    
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory data' });
  }
});

app.listen(port, () => {
  console.log(`[ ready ] http://localhost:${port}`);
});
