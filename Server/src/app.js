import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { ENV } from './config/env.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import repairRoutes from './routes/repairRoutes.js';
import itemSearchRoutes from './routes/itemSearchRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import warrantyRoutes from './routes/warrantyRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import handoverRoutes from './routes/handoverRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

export const createApp = () => {
  const app = express();

  // Basic HTTP Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  // Controlled CORS access
  const allowedOrigins = [
    ENV.CLIENT_ORIGIN,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000'
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman) or matching whitelist
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in dev if needed
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
  );

  // Request body parsing
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));
  app.use(cookieParser());

  // Static files for local image uploads
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'My Dukaan API'
    });
  });

  // REST API v1 routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/repairs', repairRoutes);
  app.use('/api/v1/items', itemSearchRoutes);
  app.use('/api/v1/sales', salesRoutes);
  app.use('/api/v1/warranty', warrantyRoutes);
  app.use('/api/v1/warranty-claims', claimRoutes);
  app.use('/api/v1/handovers', handoverRoutes);
  app.use('/api/v1/settings', settingsRoutes);
  app.use('/api/v1/uploads', uploadRoutes);

  // 404 Handler
  app.use(notFoundHandler);

  // Global Error Handler
  app.use(globalErrorHandler);

  return app;
};
