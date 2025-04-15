const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Import API routes (assumed under /api/v1)
const apiRoutes = require('./routes/api');
app.use('/api/v1', apiRoutes);

// Global error handler (basic example)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
