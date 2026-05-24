const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const { SWAGGER_PATH } = require('../utils/constants');

const swaggerDocument = YAML.load(
  path.join(__dirname, '../docs/swagger.yaml')
);

function setupSwagger(app) {
  app.use(SWAGGER_PATH, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

module.exports = { setupSwagger, swaggerDocument };
