const ISO_8601_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;

function parseIso8601Timestamp(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = String(value).trim();
  if (!trimmed) {
    return null;
  }

  if (!ISO_8601_REGEX.test(trimmed)) {
    return null;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function formatTimestampForReport(date) {
  if (!date) {
    return '';
  }
  return date instanceof Date ? date.toISOString() : new Date(date).toISOString();
}

module.exports = { parseIso8601Timestamp, formatTimestampForReport, ISO_8601_REGEX };
