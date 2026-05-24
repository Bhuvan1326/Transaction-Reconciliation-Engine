const { SCORING_WEIGHTS } = require('./constants');

function weightedDistance(timestampDeltaSeconds, quantityDeltaPct) {
  const tsDelta = timestampDeltaSeconds ?? 0;
  const qtyDelta = quantityDeltaPct ?? 0;
  return tsDelta * SCORING_WEIGHTS.TIMESTAMP + qtyDelta * SCORING_WEIGHTS.QUANTITY;
}

module.exports = { weightedDistance };
