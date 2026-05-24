const mongoose = require('mongoose');
const { SOURCES } = require('../utils/constants');

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true },
    source: { type: String, enum: [SOURCES.USER, SOURCES.EXCHANGE], required: true },
    timestamp: { type: Date, default: null },
    type: { type: String, required: true },
    asset: { type: String, required: true },
    quantity: { type: Number, required: true },
    priceUsd: { type: Number, default: 0 },
    fee: { type: Number, default: 0 },
    note: { type: String, default: '' },
    rawRow: { type: Object, default: {} },
    qualityFlag: { type: Boolean, default: false },
    qualityReason: { type: String, default: '' },
    reconciliationRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReconciliationRun',
      required: true,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ transactionId: 1, source: 1 });
transactionSchema.index({ reconciliationRunId: 1 });
transactionSchema.index({ asset: 1, type: 1, timestamp: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
