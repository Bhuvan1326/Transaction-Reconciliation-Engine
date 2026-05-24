const mongoose = require('mongoose');
const { RUN_STATUS } = require('../utils/constants');

const reconciliationRunSchema = new mongoose.Schema(
  {
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: [RUN_STATUS.PENDING, RUN_STATUS.RUNNING, RUN_STATUS.COMPLETED, RUN_STATUS.FAILED],
      default: RUN_STATUS.PENDING,
    },
    config: {
      timestampToleranceSeconds: { type: Number, required: true },
      quantityTolerancePct: { type: Number, required: true },
    },
    summary: {
      totalUser: { type: Number, default: 0 },
      totalExchange: { type: Number, default: 0 },
      matched: { type: Number, default: 0 },
      conflicting: { type: Number, default: 0 },
      unmatchedUser: { type: Number, default: 0 },
      unmatchedExchange: { type: Number, default: 0 },
      dataQualityIssues: { type: Number, default: 0 },
    },
    reportPath: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReconciliationRun', reconciliationRunSchema);
