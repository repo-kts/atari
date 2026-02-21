require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes/index.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy so rate limiters and req.ip use the real client IP behind load balancers/proxies
app.set('trust proxy', 1);

// CORS configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = [
  FRONTEND_URL,
  process.env.PRODUCTION_FRONTEND_URL, // Add production frontend URL
].filter(Boolean); // Remove undefined values

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api', routes);

// Export the app for serverless environments (Vercel, AWS Lambda, etc.)
module.exports = app;

// Only start the server if not in a serverless environment
if (process.env.VERCEL !== '1' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 API endpoint: http://localhost:${PORT}/api`);
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
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}
