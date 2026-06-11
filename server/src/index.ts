import express from 'express';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { config } from './config.js';
import { requestLogger } from './middleware/request-logger.js';
import { errorHandler } from './middleware/error-handler.js';
import apiRouter from './routes/index.js';
import { registerAdapter } from './adapters/adapter-registry.js';
import { NeteaseAdapter } from './adapters/netease/netease.adapter.js';
import { logger } from './utils/logger.js';

// Prevent process from crashing on unhandled errors
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION: ' + err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED REJECTION: ' + String(reason));
  console.error(reason);
});

// Register platform adapters
registerAdapter(new NeteaseAdapter());

// Preload OCR worker on startup
setTimeout(() => {
  import('./services/ocr.service.js').then(({ preloadWorker }) => preloadWorker());
}, 1000);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// API routes
app.use('/api', apiRouter);

// Serve client in production + PWA assetlinks
const clientDist = path.resolve(config.clientDistPath);
app.use(express.static(clientDist));

// SPA fallback
app.get('*', (_req, res) => {
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ error: '找不到页面' });
    }
  });
});

// Error handler
app.use(errorHandler);

app.listen(config.port, config.host, () => {
  logger.info(`Server running at http://localhost:${config.port}`);

  // Print local network address for phone access
  const nets = os.networkInterfaces();
  for (const details of Object.values(nets)) {
    if (!details) continue;
    for (const d of details) {
      if (d.family === 'IPv4' && !d.internal) {
        logger.info(`Phone URL: http://${d.address}:${config.port}`);
      }
    }
  }
});
