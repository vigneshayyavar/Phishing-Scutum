import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import scanRoutes from './routes/scanRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

app.disable('x-powered-by');

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://phishing-scutum.onrender.com',
  'https://phishing-scutum.netlify.app',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: '3mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'Phishing Scutum API',
    version: '2.0.0',
    time: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', scanRoutes);
app.use('/api', reportRoutes);
app.use('/api', companyRoutes);
app.use('/api', adminRoutes);

// Handle unknown routes
app.use((_req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// Central error handler
app.use((err, _req, res, _next) => {
  console.error('API error:', err);

  if (res.headersSent) {
    return;
  }

  const status = err.status || 500;

  res.status(status).json({
    message:
      status < 500
        ? err.message
        : 'Internal server error',
  });
});

// Start server after MongoDB connects
const port = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Phishing Scutum API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();