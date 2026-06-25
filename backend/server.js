require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { connectDB, seedDatabase } = require('./config/db');
const { validateEnv } = require('./config/env');
const logger = require('./utils/logger');

// Routes
const schemeRoutes = require('./routes/schemes');
const aiRoutes = require('./routes/ai');

// Validate environment variables
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
      connectSrc: ["'self'", "https:", "http:"],
      workerSrc: ["'self'", "blob:"]
    }
  }
}));

// ─── CORS Configuration ─────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5174'
];

app.use(cors({
  origin: true, // Allow all origins for the hackathon
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// ─── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request Logging ────────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: msg => logger.http(msg.trim()) }
}));

// ─── Routes ─────────────────────────────────────────────────────────────────
app.get('/api/seed-database', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database successfully seeded with 100 schemes!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use('/api/schemes', schemeRoutes);
app.use('/api/ai', aiRoutes);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    service: 'YojanaSetu API'
  });
});

// ─── Root Route ──────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🎉 Welcome to YojanaSetu API (Backend Only)',
    version: '1.0.0',
    docs: `/api/health`,
    endpoints: {
      schemes: `/api/schemes`,
      ai: `/api/ai`,
      health: `/api/health`
    }
  });
});

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// ─── Global Error Handler ───────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`\n🌐 YojanaSetu API Server Ready`);
      logger.info(`📡 Running on: http://localhost:${PORT}`);
      logger.info(`🔧 Environment: ${process.env.NODE_ENV}`);
      logger.info(`📚 Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
