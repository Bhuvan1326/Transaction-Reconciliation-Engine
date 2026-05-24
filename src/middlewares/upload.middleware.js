const path = require('path');
const fs = require('fs');
const multer = require('multer');
const env = require('../config/env');
const { UPLOAD_DIRS, ALLOWED_UPLOAD_EXTENSION } = require('../utils/constants');

[UPLOAD_DIRS.USER, UPLOAD_DIRS.EXCHANGE].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === 'userFile') {
      cb(null, UPLOAD_DIRS.USER);
    } else if (file.fieldname === 'exchangeFile') {
      cb(null, UPLOAD_DIRS.EXCHANGE);
    } else {
      cb(new Error(`Unexpected field: ${file.fieldname}`));
    }
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ALLOWED_UPLOAD_EXTENSION) {
    return cb(new Error(`Only ${ALLOWED_UPLOAD_EXTENSION} files are allowed`));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.uploadMaxSizeMb * 1024 * 1024,
  },
});

const uploadReconciliationFiles = upload.fields([
  { name: 'userFile', maxCount: 1 },
  { name: 'exchangeFile', maxCount: 1 },
]);

module.exports = { uploadReconciliationFiles };
