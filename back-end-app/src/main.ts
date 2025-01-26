import express from 'express';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.get('/', (req, res) => {
  res.send({ message: 'Hello, I am the back-end API Alex edited' });
});

app.get('/inventory', (req, res) => {
  res.send({ message: 'This will return the inventory data' });
});

app.listen(port, () => {
  console.log(`[ ready ] http://localhost:${port}`);
});
