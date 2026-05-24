module.exports = {
  SOURCES: {
    USER: 'user',
    EXCHANGE: 'exchange',
  },

  RUN_STATUS: {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },

  MATCH_STATUS: {
    MATCHED: 'MATCHED',
    CONFLICTING: 'CONFLICTING',
    UNMATCHED_USER: 'UNMATCHED_USER',
    UNMATCHED_EXCHANGE: 'UNMATCHED_EXCHANGE',
  },

  SEVERITY: {
    ERROR: 'error',
    WARNING: 'warning',
  },

  QUALITY_REASONS: {
    MISSING_TRANSACTION_ID: 'missing_transaction_id',
    MISSING_TYPE: 'missing_type',
    MISSING_ASSET: 'missing_asset',
    INVALID_TIMESTAMP: 'invalid_timestamp',
    MISSING_TIMESTAMP: 'missing_timestamp',
    INVALID_QUANTITY: 'invalid_quantity',
    DUPLICATE_TRANSACTION_ID: 'duplicate_transaction_id',
    ROW_PROCESSING_ERROR: 'row_processing_error',
  },

  TRANSACTION_TYPES: {
    BUY: 'BUY',
    SELL: 'SELL',
    TRANSFER_IN: 'TRANSFER_IN',
    TRANSFER_OUT: 'TRANSFER_OUT',
    DEPOSIT: 'DEPOSIT',
    WITHDRAWAL: 'WITHDRAWAL',
  },

  CSV_COLUMNS: {
    TRANSACTION_ID: 'transaction_id',
    TIMESTAMP: 'timestamp',
    TYPE: 'type',
    ASSET: 'asset',
    QUANTITY: 'quantity',
    PRICE_USD: 'price_usd',
    FEE: 'fee',
    NOTE: 'note',
  },

  REPORT_COLUMNS: [
    'status',
    'user_transaction_id',
    'user_timestamp',
    'user_type',
    'user_asset',
    'user_quantity',
    'user_price_usd',
    'user_fee',
    'user_note',
    'exchange_transaction_id',
    'exchange_timestamp',
    'exchange_type',
    'exchange_asset',
    'exchange_quantity',
    'exchange_price_usd',
    'exchange_fee',
    'exchange_note',
    'conflict_reason',
  ],

  DEFAULT_TIMESTAMP_TOLERANCE_SECONDS: 300,
  DEFAULT_QUANTITY_TOLERANCE_PCT: 0.01,
  BATCH_INSERT_SIZE: 500,
  UPLOAD_MAX_SIZE_MB: 10,
  ALLOWED_UPLOAD_EXTENSION: '.csv',

  API_PREFIX: '/api/v1',
  HEALTH_PATH: '/health',
  SWAGGER_PATH: '/api-docs',

  UPLOAD_DIRS: {
    USER: 'uploads/user',
    EXCHANGE: 'uploads/exchange',
  },

  REPORTS_DIR: 'reports',
  LOGS_DIR: 'logs',

  SCORING_WEIGHTS: {
    TIMESTAMP: 0.7,
    QUANTITY: 0.3,
  },

  PERSPECTIVE_FLIP: {
    TRANSFER_OUT: 'TRANSFER_IN',
    TRANSFER_IN: 'TRANSFER_OUT',
  },
};
