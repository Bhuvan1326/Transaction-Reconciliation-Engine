const transactionRepository = require('../repositories/transaction.repository');
const reconciliationRepository = require('../repositories/reconciliation.repository');
const qualityIssueRepository = require('../repositories/qualityIssue.repository');
const ingestionService = require('./ingestion.service');
const matchingService = require('./matching.service');
const reportService = require('./report.service');
const logger = require('../config/logger');
const env = require('../config/env');
const { RUN_STATUS, SOURCES } = require('../utils/constants');

function resolveConfig(overrides = {}) {
  return {
    timestampToleranceSeconds:
      overrides.timestampToleranceSeconds ?? env.timestampToleranceSeconds,
    quantityTolerancePct:
      overrides.quantityTolerancePct ?? env.quantityTolerancePct,
  };
}

async function executeReconciliation(runId, userFilePath, exchangeFilePath, configOverrides) {
  const config = resolveConfig(configOverrides);

  try {
    await reconciliationRepository.updateRun(runId, {
      status: RUN_STATUS.RUNNING,
      config,
    });

    const ingestionSummary = await ingestionService.ingestBothFiles(
      userFilePath,
      exchangeFilePath,
      runId
    );

    const userTxs = await transactionRepository.findByRunAndSource(runId, SOURCES.USER);
    const exchangeTxs = await transactionRepository.findByRunAndSource(
      runId,
      SOURCES.EXCHANGE
    );

    const matchResults = matchingService.matchTransactions(userTxs, exchangeTxs, config);
    const matchSummary = matchingService.summarizeResults(matchResults);

    const reportPath = await reportService.generateReport(runId, matchResults);

    const summary = {
      totalUser: ingestionSummary.totalUser,
      totalExchange: ingestionSummary.totalExchange,
      matched: matchSummary.matched,
      conflicting: matchSummary.conflicting,
      unmatchedUser: matchSummary.unmatchedUser,
      unmatchedExchange: matchSummary.unmatchedExchange,
      dataQualityIssues: ingestionSummary.dataQualityIssues,
    };

    await reconciliationRepository.updateRun(runId, {
      status: RUN_STATUS.COMPLETED,
      completedAt: new Date(),
      summary,
      reportPath,
    });

    logger.info('Reconciliation completed', {
      runId: String(runId),
      summary,
    });

    return { runId, status: RUN_STATUS.COMPLETED, summary };
  } catch (err) {
    logger.error('Reconciliation failed', {
      runId: String(runId),
      error: err.message,
      stack: err.stack,
    });

    await reconciliationRepository.updateRun(runId, {
      status: RUN_STATUS.FAILED,
      completedAt: new Date(),
    });

    throw err;
  }
}

async function getRunStatus(runId) {
  const run = await reconciliationRepository.findRunById(runId);
  if (!run) {
    return null;
  }
  return run;
}

async function getQualityIssues(runId, pagination) {
  return qualityIssueRepository.findByRun(runId, pagination);
}

module.exports = {
  resolveConfig,
  executeReconciliation,
  getRunStatus,
  getQualityIssues,
};
