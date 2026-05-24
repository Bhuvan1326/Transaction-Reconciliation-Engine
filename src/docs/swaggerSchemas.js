module.exports = {
  ReconciliationStartResponse: {
    type: 'object',
    properties: {
      runId: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' },
      status: { type: 'string', example: 'running' },
    },
  },
  ReconciliationStatusResponse: {
    type: 'object',
    properties: {
      runId: { type: 'string' },
      status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed'] },
      startedAt: { type: 'string', format: 'date-time' },
      completedAt: { type: 'string', format: 'date-time', nullable: true },
      config: {
        type: 'object',
        properties: {
          timestampToleranceSeconds: { type: 'integer', example: 300 },
          quantityTolerancePct: { type: 'number', example: 0.01 },
        },
      },
      summary: {
        type: 'object',
        properties: {
          totalUser: { type: 'integer' },
          totalExchange: { type: 'integer' },
          matched: { type: 'integer' },
          conflicting: { type: 'integer' },
          unmatchedUser: { type: 'integer' },
          unmatchedExchange: { type: 'integer' },
          dataQualityIssues: { type: 'integer' },
        },
      },
      reportPath: { type: 'string' },
    },
  },
  HealthResponse: {
    type: 'object',
    properties: {
      status: { type: 'string', example: 'ok' },
      uptime: { type: 'number', example: 123.456 },
      timestamp: { type: 'string', format: 'date-time' },
    },
  },
  QualityIssuesResponse: {
    type: 'object',
    properties: {
      runId: { type: 'string' },
      page: { type: 'integer' },
      limit: { type: 'integer' },
      total: { type: 'integer' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            source: { type: 'string' },
            rowIndex: { type: 'integer' },
            transactionId: { type: 'string' },
            reason: { type: 'string' },
            severity: { type: 'string', enum: ['error', 'warning'] },
          },
        },
      },
    },
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      error: { type: 'string' },
      message: { type: 'string' },
    },
  },
};
