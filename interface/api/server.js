require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('../../utils/logger');
const { errorHandler } = require('../../utils/errors');
const apiRoutes = require('./routes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

// Security Middleware (Zafkiel's Wall)
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts/styles for React
}));
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true, 
  legacyHeaders: false,
  message: { success: false, message: "Too many time manipulations from this IP, please try again after 15 minutes." },
  handler: (req, res, next, options) => {
    logger.error(`[RATE LIMIT EXCEEDED] IP: ${req.ip} tried to access ${req.url}`);
    res.status(options.statusCode).json(options.message);
  }
});

// Apply rate limiting to API routes
app.use('/api', limiter);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api', apiRoutes);

// Serve static frontend files
const distPath = path.join(__dirname, '../web/dist');
app.use(express.static(distPath));

// Catch-all route to serve frontend index.html
app.get(/.*/, (req, res) => {
  // If request is for /api, don't serve index.html (should have been handled above)
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send("Frontend build not found. Please ensure 'npm run build' was executed.");
    }
  });
});

// Global Error Handler
app.use(errorHandler);

// Only listen if not running as a serverless function (Vercel)
if (!isProduction) {
  app.listen(PORT, () => {
    logger.info(`Zafkiel Arcade 1 backend running on port ${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app;
