const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const { setupSwagger } = require('./config/swagger');
const { requestLogger } = require('./middlewares/logger.middleware');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');
const healthRoutes = require('./routes/health.routes');
const reconciliationRoutes = require('./routes/reconciliation.routes');
const {
  API_PREFIX,
  HEALTH_PATH,
  REPORTS_DIR,
  LOGS_DIR,
  UPLOAD_DIRS,
} = require('./utils/constants');

const app = express();

[REPORTS_DIR, LOGS_DIR, UPLOAD_DIRS.USER, UPLOAD_DIRS.EXCHANGE].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

setupSwagger(app);

app.use(HEALTH_PATH, healthRoutes);
app.use(API_PREFIX, reconciliationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
