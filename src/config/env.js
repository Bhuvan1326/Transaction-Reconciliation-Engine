require('dotenv').config();

const {
  DEFAULT_TIMESTAMP_TOLERANCE_SECONDS,
  DEFAULT_QUANTITY_TOLERANCE_PCT,
  BATCH_INSERT_SIZE,
  UPLOAD_MAX_SIZE_MB,
} = require('../utils/constants');

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  mongodbUri:
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/transaction_reconciliation',
  timestampToleranceSeconds:
    parseInt(process.env.TIMESTAMP_TOLERANCE_SECONDS, 10) ||
    DEFAULT_TIMESTAMP_TOLERANCE_SECONDS,
  quantityTolerancePct:
    parseFloat(process.env.QUANTITY_TOLERANCE_PCT) ||
    DEFAULT_QUANTITY_TOLERANCE_PCT,
  logLevel: process.env.LOG_LEVEL || 'info',
  batchInsertSize: parseInt(process.env.BATCH_INSERT_SIZE, 10) || BATCH_INSERT_SIZE,
  uploadMaxSizeMb: parseInt(process.env.UPLOAD_MAX_SIZE_MB, 10) || UPLOAD_MAX_SIZE_MB,
};

module.exports = env;
