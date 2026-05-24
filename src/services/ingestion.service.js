const transactionRepository = require('../repositories/transaction.repository');
const qualityIssueRepository = require('../repositories/qualityIssue.repository');
const { createCsvReadStream } = require('../utils/csvParser');
const { normalizeAsset } = require('../utils/assetMapper');
const { normalizeType } = require('../utils/typeMapper');
const { parseIso8601Timestamp } = require('../utils/dateHelper');
const logger = require('../config/logger');
const env = require('../config/env');
const {
  SOURCES,
  SEVERITY,
  QUALITY_REASONS,
  CSV_COLUMNS,
} = require('../utils/constants');

function parseNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

function isValidQuantity(quantity) {
  return Number.isFinite(quantity) && quantity >= 0;
}

function buildTransactionDoc(row, source, runId, rowIndex, seenIds) {
  const issues = [];
  let highestSeverity = null;

  const addIssue = (reason, severity) => {
    issues.push({
      reconciliationRunId: runId,
      source,
      rowIndex,
      transactionId: row[CSV_COLUMNS.TRANSACTION_ID] || '',
      rawRow: { ...row },
      reason,
      severity,
    });
    if (severity === SEVERITY.ERROR) {
      highestSeverity = SEVERITY.ERROR;
    } else if (highestSeverity !== SEVERITY.ERROR) {
      highestSeverity = SEVERITY.WARNING;
    }
  };

  const transactionId = (row[CSV_COLUMNS.TRANSACTION_ID] || '').trim();
  if (!transactionId) {
    addIssue(QUALITY_REASONS.MISSING_TRANSACTION_ID, SEVERITY.ERROR);
  }

  const rawType = row[CSV_COLUMNS.TYPE];
  const normalizedType = normalizeType(rawType, source);
  if (!normalizedType) {
    addIssue(QUALITY_REASONS.MISSING_TYPE, SEVERITY.ERROR);
  }

  const rawAsset = row[CSV_COLUMNS.ASSET];
  const normalizedAsset = normalizeAsset(rawAsset);
  if (!normalizedAsset) {
    addIssue(QUALITY_REASONS.MISSING_ASSET, SEVERITY.ERROR);
  }

  const rawTimestamp = row[CSV_COLUMNS.TIMESTAMP];
  let timestamp = null;
  if (rawTimestamp === null || rawTimestamp === undefined || String(rawTimestamp).trim() === '') {
    addIssue(QUALITY_REASONS.MISSING_TIMESTAMP, SEVERITY.WARNING);
  } else {
    timestamp = parseIso8601Timestamp(rawTimestamp);
    if (!timestamp) {
      addIssue(QUALITY_REASONS.INVALID_TIMESTAMP, SEVERITY.WARNING);
    }
  }

  const quantity = parseNumber(row[CSV_COLUMNS.QUANTITY], NaN);
  if (!isValidQuantity(quantity)) {
    addIssue(QUALITY_REASONS.INVALID_QUANTITY, SEVERITY.ERROR);
  }

  if (transactionId && seenIds.has(transactionId)) {
    addIssue(QUALITY_REASONS.DUPLICATE_TRANSACTION_ID, SEVERITY.WARNING);
  }
  if (transactionId) {
    seenIds.add(transactionId);
  }

  const qualityFlag = issues.length > 0;
  const qualityReason = issues.map((i) => i.reason).join('; ');

  const doc = {
    transactionId: transactionId || `__missing_${source}_${rowIndex}`,
    source,
    timestamp,
    type: normalizedType || 'UNKNOWN',
    asset: normalizedAsset || 'UNKNOWN',
    quantity: isValidQuantity(quantity) ? quantity : 0,
    priceUsd: parseNumber(row[CSV_COLUMNS.PRICE_USD], 0),
    fee: parseNumber(row[CSV_COLUMNS.FEE], 0),
    note: row[CSV_COLUMNS.NOTE] || '',
    rawRow: { ...row },
    qualityFlag,
    qualityReason,
    reconciliationRunId: runId,
  };

  if (qualityFlag) {
    logger.warn('Row quality flag', {
      runId: String(runId),
      source,
      rowIndex,
      transactionId: doc.transactionId,
      reasons: qualityReason,
    });
  }

  return { doc, issues, highestSeverity };
}

async function flushBatch(transactionBuffer, issueBuffer) {
  const batchSize = env.batchInsertSize;

  if (transactionBuffer.length >= batchSize) {
    const batch = transactionBuffer.splice(0, batchSize);
    await transactionRepository.insertMany(batch);
  }

  if (issueBuffer.length >= batchSize) {
    const batch = issueBuffer.splice(0, batchSize);
    await qualityIssueRepository.insertMany(batch);
  }
}

async function ingestFile(filePath, source, runId) {
  const transactionBuffer = [];
  const issueBuffer = [];
  const seenIds = new Set();
  let rowIndex = 0;
  let issueCount = 0;

  const parser = createCsvReadStream(filePath);

  for await (const row of parser) {
    rowIndex += 1;
    try {
      const { doc, issues } = buildTransactionDoc(row, source, runId, rowIndex, seenIds);
      transactionBuffer.push(doc);
      issueBuffer.push(...issues);
      issueCount += issues.length;

      if (transactionBuffer.length >= env.batchInsertSize) {
        const batch = transactionBuffer.splice(0, env.batchInsertSize);
        await transactionRepository.insertMany(batch);
      }
      if (issueBuffer.length >= env.batchInsertSize) {
        const batch = issueBuffer.splice(0, env.batchInsertSize);
        await qualityIssueRepository.insertMany(batch);
      }
    } catch (err) {
      logger.warn('Row processing error', {
        runId: String(runId),
        source,
        rowIndex,
        error: err.message,
      });
      issueBuffer.push({
        reconciliationRunId: runId,
        source,
        rowIndex,
        transactionId: row[CSV_COLUMNS.TRANSACTION_ID] || '',
        rawRow: { ...row },
        reason: QUALITY_REASONS.ROW_PROCESSING_ERROR,
        severity: SEVERITY.ERROR,
      });
      issueCount += 1;

      transactionBuffer.push({
        transactionId: (row[CSV_COLUMNS.TRANSACTION_ID] || `__error_${source}_${rowIndex}`).trim(),
        source,
        timestamp: null,
        type: 'UNKNOWN',
        asset: 'UNKNOWN',
        quantity: 0,
        priceUsd: 0,
        fee: 0,
        note: row[CSV_COLUMNS.NOTE] || '',
        rawRow: { ...row },
        qualityFlag: true,
        qualityReason: QUALITY_REASONS.ROW_PROCESSING_ERROR,
        reconciliationRunId: runId,
      });
    }
  }

  if (transactionBuffer.length > 0) {
    await transactionRepository.insertMany(transactionBuffer);
  }
  if (issueBuffer.length > 0) {
    await qualityIssueRepository.insertMany(issueBuffer);
  }

  logger.info('Ingestion completed', {
    runId: String(runId),
    source,
    rowsProcessed: rowIndex,
    issueCount,
  });

  return { rowsProcessed: rowIndex, issueCount };
}

async function ingestBothFiles(userFilePath, exchangeFilePath, runId) {
  const userResult = await ingestFile(userFilePath, SOURCES.USER, runId);
  const exchangeResult = await ingestFile(exchangeFilePath, SOURCES.EXCHANGE, runId);

  return {
    totalUser: userResult.rowsProcessed,
    totalExchange: exchangeResult.rowsProcessed,
    dataQualityIssues: userResult.issueCount + exchangeResult.issueCount,
  };
}

module.exports = {
  ingestFile,
  ingestBothFiles,
  buildTransactionDoc,
};
