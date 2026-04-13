const express = require('express');
const path = require('path');
require('dotenv').config();

const apiRouter = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ status: 'error', message: 'API route not found.' });
});

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Sabor de Casa running on http://localhost:${PORT}`);
});
