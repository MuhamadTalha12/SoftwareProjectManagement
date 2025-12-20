const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST, before importing anything that uses them
dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const proposalRoutes = require('./routes/proposalRoute');

// Connect to database with error handling
connectDB().catch(err => {
  console.error('Database connection failed:', err);
});

const app = express();

app.use(cors());
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/proposals', proposalRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Add catch-all error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Add 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
// Only listen on port if we are NOT on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
module.exports = app;