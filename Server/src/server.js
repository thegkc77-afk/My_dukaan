import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/database.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const app = createApp();

    const server = app.listen(ENV.PORT, () => {
      console.log(`[My Dukaan Server] Running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
      console.log(`[Health check] http://localhost:${ENV.PORT}/api/health`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Closed all connections. Exiting process.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    return server;
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
};

startServer();
