const DataQualityIssue = require('../models/DataQualityIssue');

async function insertMany(issues) {
  if (!issues.length) {
    return [];
  }
  return DataQualityIssue.insertMany(issues, { ordered: false });
}

async function findByRun(runId, { skip = 0, limit = 50 } = {}) {
  const query = DataQualityIssue.find({ reconciliationRunId: runId })
    .sort({ rowIndex: 1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const [items, total] = await Promise.all([
    query,
    DataQualityIssue.countDocuments({ reconciliationRunId: runId }),
  ]);

  return { items, total, skip, limit };
}

module.exports = {
  insertMany,
  findByRun,
};
