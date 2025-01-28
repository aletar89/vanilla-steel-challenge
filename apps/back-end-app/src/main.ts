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
app.get('/api/inventory/stats', async (req, res) => {
  try {
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

    res.json({
      totalItems: totalItems?.total || 0,
      totalVolume: totalVolume?.totalWeight || 0
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({ error: 'Failed to fetch inventory statistics' });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    const [inventory, totalCount] = await Promise.all([
      db
        .selectFrom('inventory')
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
    
    res.json({
      data: inventory,
      total: totalCount?.total || 0
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory data' });
  }
});

app.listen(port, () => {
  console.log(`[ ready ] http://localhost:${port}`);
});
