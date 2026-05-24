function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const err = new Error(error.details.map((d) => d.message).join('; '));
      err.statusCode = 400;
      err.name = 'ValidationError';
      return next(err);
    }

    req[property] = value;
    next();
  };
}

module.exports = { validate };
