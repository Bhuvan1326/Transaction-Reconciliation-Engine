const { MATCH_STATUS } = require('./constants');
const { timestampWithinTolerance, quantityWithinTolerance } = require('./tolerance');

function classify(userTx, exchangeTx, config) {
  const tsResult = timestampWithinTolerance(
    userTx.timestamp,
    exchangeTx.timestamp,
    config.timestampToleranceSeconds
  );

  const qtyResult = quantityWithinTolerance(
    userTx.quantity,
    exchangeTx.quantity,
    config.quantityTolerancePct
  );

  const tsOk = tsResult.skipped || tsResult.within;
  const qtyOk = qtyResult.within;

  if (tsOk && qtyOk) {
    return { status: MATCH_STATUS.MATCHED, conflictReason: null };
  }

  const parts = [];
  if (!qtyOk) {
    parts.push(`quantity_delta: ${qtyResult.deltaPct.toFixed(4)}%`);
  }
  if (!tsResult.skipped && !tsResult.within) {
    parts.push(`timestamp_delta: ${tsResult.deltaSeconds.toFixed(2)}s`);
  }

  return {
    status: MATCH_STATUS.CONFLICTING,
    conflictReason: parts.join(', '),
  };
}

module.exports = { classify };
