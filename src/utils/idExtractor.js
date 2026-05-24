function extractNumeric(transactionId) {
  if (transactionId === null || transactionId === undefined) {
    return null;
  }

  const str = String(transactionId).trim();
  const match = str.match(/(\d+)$/);
  if (!match) {
    return null;
  }

  return parseInt(match[1], 10);
}

module.exports = { extractNumeric };
