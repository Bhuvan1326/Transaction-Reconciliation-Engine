const path = require('path');
const fs = require('fs');
const reconciliationRepository = require('../repositories/reconciliation.repository');
const reconciliationService = require('../services/reconciliation.service');
const { startReconciliationJob } = require('../jobs/reconcile.job');
const logger = require('../config/logger');
const { RUN_STATUS } = require('../utils/constants');

async function startReconciliation(req, res, next) {
  try {
    const { userFile, exchangeFile } = req.uploadedFiles;
    const configOverrides = req.body || {};

    const config = reconciliationService.resolveConfig(configOverrides);
    const run = await reconciliationRepository.createRun(config);

    const runId = run._id;

    logger.info('Reconciliation started', {
      runId: String(runId),
      config,
    });

    await reconciliationRepository.updateRun(runId, { status: RUN_STATUS.RUNNING });

    startReconciliationJob(
      runId,
      userFile.path,
      exchangeFile.path,
      configOverrides
    );

    res.status(202).json({
      runId: String(runId),
      status: RUN_STATUS.RUNNING,
    });
  } catch (err) {
    next(err);
  }
}

async function getReconciliationStatus(req, res, next) {
  try {
    const { runId } = req.params;
    const run = await reconciliationService.getRunStatus(runId);

    if (!run) {
      const err = new Error('Reconciliation run not found');
      err.statusCode = 404;
      throw err;
    }

    res.json({
      runId: String(run._id),
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      config: run.config,
      summary: run.summary,
      reportPath: run.reportPath,
    });
  } catch (err) {
    next(err);
  }
}

async function downloadReport(req, res, next) {
  try {
    const { runId } = req.params;
    const run = await reconciliationService.getRunStatus(runId);

    if (!run) {
      const err = new Error('Reconciliation run not found');
      err.statusCode = 404;
      throw err;
    }

    if (!run.reportPath || !fs.existsSync(run.reportPath)) {
      const err = new Error('Report not available');
      err.statusCode = 404;
      throw err;
    }

    const filename = path.basename(run.reportPath);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const stream = fs.createReadStream(run.reportPath);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
}

async function getQualityIssues(req, res, next) {
  try {
    const { runId } = req.params;
    const { page, limit } = req.query;

    const run = await reconciliationService.getRunStatus(runId);
    if (!run) {
      const err = new Error('Reconciliation run not found');
      err.statusCode = 404;
      throw err;
    }

    const skip = (page - 1) * limit;
    const result = await reconciliationService.getQualityIssues(runId, { skip, limit });

    res.json({
      runId: String(runId),
      page,
      limit,
      total: result.total,
      items: result.items,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  startReconciliation,
  getReconciliationStatus,
  downloadReport,
  getQualityIssues,
};
