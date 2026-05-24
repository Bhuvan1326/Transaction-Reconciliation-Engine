const path = require('path');
const { createCsvWriteStream } = require('../utils/csvWriter');
const { formatTimestampForReport } = require('../utils/dateHelper');
const { REPORT_COLUMNS, REPORTS_DIR, MATCH_STATUS } = require('../utils/constants');

function mapTransactionToReportFields(tx, prefix) {
  if (!tx) {
    return {
      [`${prefix}_transaction_id`]: '',
      [`${prefix}_timestamp`]: '',
      [`${prefix}_type`]: '',
      [`${prefix}_asset`]: '',
      [`${prefix}_quantity`]: '',
      [`${prefix}_price_usd`]: '',
      [`${prefix}_fee`]: '',
      [`${prefix}_note`]: '',
    };
  }

  return {
    [`${prefix}_transaction_id`]: tx.transactionId || '',
    [`${prefix}_timestamp`]: formatTimestampForReport(tx.timestamp),
    [`${prefix}_type`]: tx.type || '',
    [`${prefix}_asset`]: tx.asset || '',
    [`${prefix}_quantity`]: tx.quantity ?? '',
    [`${prefix}_price_usd`]: tx.priceUsd ?? '',
    [`${prefix}_fee`]: tx.fee ?? '',
    [`${prefix}_note`]: tx.note || '',
  };
}

function resultToRow(result) {
  const userFields = mapTransactionToReportFields(result.userTx, 'user');
  const exchangeFields = mapTransactionToReportFields(result.exchangeTx, 'exchange');

  return {
    status: result.status,
    ...userFields,
    ...exchangeFields,
    conflict_reason: result.conflictReason || '',
  };
}

async function generateReport(runId, matchResults) {
  const reportPath = path.join(REPORTS_DIR, `reconciliation_${runId}.csv`);
  const writer = createCsvWriteStream(reportPath, REPORT_COLUMNS);

  for (const result of matchResults) {
    await writer.writeRow(resultToRow(result));
  }

  await writer.end();
  return reportPath;
}

module.exports = {
  generateReport,
  resultToRow,
  mapTransactionToReportFields,
};
