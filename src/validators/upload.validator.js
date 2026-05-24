const Joi = require('joi');
const { ALLOWED_UPLOAD_EXTENSION } = require('../utils/constants');

const csvFileSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string()
    .pattern(new RegExp(`\\${ALLOWED_UPLOAD_EXTENSION}$`, 'i'))
    .required()
    .messages({
      'string.pattern.base': `File must have ${ALLOWED_UPLOAD_EXTENSION} extension`,
    }),
  encoding: Joi.string(),
  mimetype: Joi.string(),
  destination: Joi.string(),
  filename: Joi.string().required(),
  path: Joi.string().required(),
  size: Joi.number().max(10 * 1024 * 1024).required(),
}).unknown(true);

function validateUploadedFiles(req, res, next) {
  const userFile = req.files?.userFile?.[0];
  const exchangeFile = req.files?.exchangeFile?.[0];

  const errors = [];

  if (!userFile) {
    errors.push('userFile is required');
  } else {
    const { error } = csvFileSchema.validate(userFile);
    if (error) {
      errors.push(`userFile: ${error.message}`);
    }
  }

  if (!exchangeFile) {
    errors.push('exchangeFile is required');
  } else {
    const { error } = csvFileSchema.validate(exchangeFile);
    if (error) {
      errors.push(`exchangeFile: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    const err = new Error(errors.join('; '));
    err.statusCode = 400;
    err.name = 'ValidationError';
    return next(err);
  }

  req.uploadedFiles = {
    userFile,
    exchangeFile,
  };

  next();
}

module.exports = { validateUploadedFiles, csvFileSchema };
