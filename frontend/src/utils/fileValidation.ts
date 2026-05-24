const ALLOWED_EXTENSION = '.csv';
const MAX_SIZE_MB = 10;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateCsvFile(file: File): FileValidationResult {
  const name = file.name.toLowerCase();
  if (!name.endsWith(ALLOWED_EXTENSION)) {
    return {
      valid: false,
      error: `Invalid file type. Only ${ALLOWED_EXTENSION} files are allowed.`,
    };
  }

  const maxBytes = MAX_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File exceeds maximum size of ${MAX_SIZE_MB} MB.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty.',
    };
  }

  return { valid: true };
}
