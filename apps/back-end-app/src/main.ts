import express from 'express';
import cors from 'cors';
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
app.get('/api/data', (req, res) => {
  // Replace with your actual data
  res.json([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ]);
});

app.post('/api/preferences', (req, res) => {
  const formData = req.body;
  // Handle the form data (e.g., save to database)
  console.log('Received form data:', formData);
  res.json({ success: true, message: 'Preferences saved successfully' });
});

app.listen(port, () => {
  console.log(`[ ready ] http://localhost:${port}`);
});
