const path = require('path');
const winston = require('winston');
const env = require('./env');
const { LOGS_DIR } = require('../utils/constants');

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: env.logLevel,
  format: logFormat,
  defaultMeta: { service: 'transaction-reconciliation-engine' },
  transports: [
    new winston.transports.File({
      filename: path.join(LOGS_DIR, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(LOGS_DIR, 'combined.log'),
    }),
  ],
});

if (env.nodeEnv !== 'test') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      ),
    })
  );
}

module.exports = logger;
