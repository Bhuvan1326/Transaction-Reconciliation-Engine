const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');
const logger = require('./config/logger');

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      logger.info('Server started', { port: env.port, env: env.nodeEnv });
    });

    const shutdown = async (signal) => {
      logger.info('Shutdown signal received', { signal });
      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error('Failed to start server', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
