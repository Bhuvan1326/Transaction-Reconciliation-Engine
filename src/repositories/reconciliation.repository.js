const ReconciliationRun = require('../models/ReconciliationRun');
const { RUN_STATUS } = require('../utils/constants');

async function createRun(config) {
  const run = new ReconciliationRun({
    status: RUN_STATUS.PENDING,
    config,
    startedAt: new Date(),
  });
  return run.save();
}

async function updateRun(runId, patch) {
  return ReconciliationRun.findByIdAndUpdate(
    runId,
    { $set: patch },
    { new: true }
  ).lean();
}

async function findRunById(runId) {
  return ReconciliationRun.findById(runId).lean();
}

module.exports = {
  createRun,
  updateRun,
  findRunById,
};
