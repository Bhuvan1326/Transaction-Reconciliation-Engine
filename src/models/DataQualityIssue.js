const mongoose = require('mongoose');
const { SEVERITY } = require('../utils/constants');

const dataQualityIssueSchema = new mongoose.Schema(
  {
    reconciliationRunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReconciliationRun',
      required: true,
    },
    source: { type: String, required: true },
    rowIndex: { type: Number, required: true },
    transactionId: { type: String, default: '' },
    rawRow: { type: Object, default: {} },
    reason: { type: String, required: true },
    severity: { type: String, enum: [SEVERITY.ERROR, SEVERITY.WARNING], required: true },
  },
  { timestamps: true }
);

dataQualityIssueSchema.index({ reconciliationRunId: 1 });

module.exports = mongoose.model('DataQualityIssue', dataQualityIssueSchema);
