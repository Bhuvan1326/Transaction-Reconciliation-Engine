const express = require('express');
const reconciliationController = require('../controllers/reconciliation.controller');
const { uploadReconciliationFiles } = require('../middlewares/upload.middleware');
const { validateUploadedFiles } = require('../validators/upload.validator');
const { validate } = require('../middlewares/validation.middleware');
const {
  reconcileConfigSchema,
  issuesQuerySchema,
  runIdParamSchema,
} = require('../validators/reconcile.validator');

const router = express.Router();

router.post(
  '/reconcile',
  uploadReconciliationFiles,
  validateUploadedFiles,
  validate(reconcileConfigSchema),
  reconciliationController.startReconciliation
);

router.get(
  '/reconcile/:runId',
  validate(runIdParamSchema, 'params'),
  reconciliationController.getReconciliationStatus
);

router.get(
  '/reconcile/:runId/report',
  validate(runIdParamSchema, 'params'),
  reconciliationController.downloadReport
);

router.get(
  '/reconcile/:runId/issues',
  validate(runIdParamSchema, 'params'),
  validate(issuesQuerySchema, 'query'),
  reconciliationController.getQualityIssues
);

module.exports = router;
