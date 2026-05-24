const Joi = require('joi');

const reconcileConfigSchema = Joi.object({
  timestampToleranceSeconds: Joi.number().integer().positive().optional(),
  quantityTolerancePct: Joi.number().positive().max(100).optional(),
});

const issuesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
});

const runIdParamSchema = Joi.object({
  runId: Joi.string().hex().length(24).required(),
});

module.exports = {
  reconcileConfigSchema,
  issuesQuerySchema,
  runIdParamSchema,
};
