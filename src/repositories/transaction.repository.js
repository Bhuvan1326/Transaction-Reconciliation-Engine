const Transaction = require('../models/Transaction');

async function insertMany(transactions) {
  if (!transactions.length) {
    return [];
  }
  return Transaction.insertMany(transactions, { ordered: false });
}

async function findByRun(runId) {
  return Transaction.find({ reconciliationRunId: runId }).lean();
}

async function findByRunAndSource(runId, source) {
  return Transaction.find({ reconciliationRunId: runId, source }).lean();
}

module.exports = {
  insertMany,
  findByRun,
  findByRunAndSource,
};
