const reconciliationService = require('../services/reconciliation.service');
const logger = require('../config/logger');

function startReconciliationJob(runId, userFilePath, exchangeFilePath, configOverrides) {
  setImmediate(async () => {
    try {
      await reconciliationService.executeReconciliation(
        runId,
        userFilePath,
        exchangeFilePath,
        configOverrides
      );
    } catch (err) {
      logger.error('Reconciliation job failed', {
        runId: String(runId),
        error: err.message,
      });
    }
  });
}

module.exports = { startReconciliationJob };
