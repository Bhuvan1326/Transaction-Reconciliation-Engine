function timestampWithinTolerance(userTimestamp, exchangeTimestamp, toleranceSeconds) {
  if (userTimestamp === null || userTimestamp === undefined) {
    return { within: true, deltaSeconds: null, skipped: true };
  }
  if (exchangeTimestamp === null || exchangeTimestamp === undefined) {
    return { within: true, deltaSeconds: null, skipped: true };
  }

  const userMs = userTimestamp instanceof Date ? userTimestamp.getTime() : new Date(userTimestamp).getTime();
  const exchangeMs = exchangeTimestamp instanceof Date ? exchangeTimestamp.getTime() : new Date(exchangeTimestamp).getTime();

  const deltaSeconds = Math.abs(userMs - exchangeMs) / 1000;
  return {
    within: deltaSeconds <= toleranceSeconds,
    deltaSeconds,
    skipped: false,
  };
}

function quantityWithinTolerance(userQuantity, exchangeQuantity, tolerancePct) {
  if (exchangeQuantity === 0) {
    const deltaPct = userQuantity === 0 ? 0 : 100;
    return {
      within: userQuantity === 0,
      deltaPct,
    };
  }

  const deltaPct = (Math.abs(userQuantity - exchangeQuantity) / Math.abs(exchangeQuantity)) * 100;
  return {
    within: deltaPct <= tolerancePct,
    deltaPct,
  };
}

module.exports = {
  timestampWithinTolerance,
  quantityWithinTolerance,
};
