require('dotenv').config();
require('dns').setDefaultResultOrder('ipv4first');
// Node's Happy Eyeballs default 250ms per-address timeout is too short for
// high-latency routes to Neon (AWS). Give it 5s so TCP can actually complete.
require('net').setDefaultAutoSelectFamilyAttemptTimeout(5000);

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes/index.js');
const { errorHandlerMiddleware } = require('./utils/errorHandler.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy so rate limiters and req.ip use the real client IP behind load balancers/proxies
app.set('trust proxy', 1);

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174'];
// const allowedOrigins = [
//   FRONTEND_URL,
//   process.env.PRODUCTION_FRONTEND_URL, // Add production frontend URL
// ].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
}));

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api', routes);

// Error handling middleware (must be last)
app.use(errorHandlerMiddleware);

// Export the app for serverless environments (Vercel, AWS Lambda, etc.)
module.exports = app;

// Only start the server if not in a serverless environment
if (process.env.VERCEL !== '1' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please stop the other process or use a different port.`);
      console.error(`   To find and kill the process: lsof -ti:${PORT} | xargs kill -9`);
    } else {
      console.error('❌ Failed to start server:', error.message);
    }
    process.exit(1);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    console.log(`${signal} signal received: closing HTTP server`);
    server.close(() => {
      console.log('HTTP server closed');
    });

    try {
      // Disconnect Prisma (and its underlying pg pool)
      const prisma = require('./config/prisma.js');
      if (prisma?.$disconnect) {
        await prisma.$disconnect();
        console.log('Prisma disconnected');
      }
    } catch (e) {
      // ignore
    }

    try {
      // Close Redis
      const cacheService = require('./services/cache/redisCacheService.js');
      if (cacheService?.close) {
        await cacheService.close();
        console.log('Redis closed');
      }
    } catch (e) {
      // ignore
    }

    // Force exit after a short delay in case something still holds the event loop
    setTimeout(() => process.exit(0), 500).unref();
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
