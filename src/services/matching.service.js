const { extractNumeric } = require('../utils/idExtractor');
const { typesMatchForReconciliation } = require('../utils/typeMapper');
const { timestampWithinTolerance, quantityWithinTolerance } = require('../utils/tolerance');
const { weightedDistance } = require('../utils/scoring');
const { classify } = require('../utils/matchClassifier');
const logger = require('../config/logger');
const { MATCH_STATUS, SOURCES } = require('../utils/constants');

function buildCandidatePools(userTxs, exchangeTxs) {
  const exchangeByAssetType = new Map();

  for (const ex of exchangeTxs) {
    const key = `${ex.asset}::${ex.type}`;
    if (!exchangeByAssetType.has(key)) {
      exchangeByAssetType.set(key, []);
    }
    exchangeByAssetType.get(key).push(ex);
  }

  const userNumericIds = userTxs.map((tx) => ({
    tx,
    numeric: extractNumeric(tx.transactionId),
  }));

  const exchangeNumericIds = exchangeTxs.map((tx) => ({
    tx,
    numeric: extractNumeric(tx.transactionId),
  }));

  return { exchangeByAssetType, userNumericIds, exchangeNumericIds };
}

function getCandidatesForUser(userTx, exchangeByAssetType, exchangeTxs, consumedIds) {
  const candidates = [];

  for (const ex of exchangeTxs) {
    if (consumedIds.has(String(ex._id))) {
      continue;
    }
    if (ex.asset !== userTx.asset) {
      continue;
    }
    if (!typesMatchForReconciliation(userTx.type, ex.type)) {
      continue;
    }
    candidates.push(ex);
  }

  return candidates;
}

function scoreCandidate(userTx, exchangeTx, config) {
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

  return {
    exchangeTx,
    tsResult,
    qtyResult,
    score: weightedDistance(
      tsResult.deltaSeconds ?? 0,
      qtyResult.deltaPct ?? 0
    ),
    withinTimestamp: tsResult.skipped || tsResult.within,
    withinQuantity: qtyResult.within,
  };
}

function selectBestCandidate(userTx, candidates, config) {
  const toleranceCandidates = candidates.filter((ex) => {
    const tsResult = timestampWithinTolerance(
      userTx.timestamp,
      ex.timestamp,
      config.timestampToleranceSeconds
    );
    const qtyResult = quantityWithinTolerance(
      userTx.quantity,
      ex.quantity,
      config.quantityTolerancePct
    );
    return (tsResult.skipped || tsResult.within) && qtyResult.within;
  });

  const pool = toleranceCandidates.length > 0 ? toleranceCandidates : candidates;

  if (pool.length === 0) {
    return null;
  }

  let best = null;
  let bestScore = Infinity;

  for (const ex of pool) {
    const scored = scoreCandidate(userTx, ex, config);
    if (scored.score < bestScore) {
      bestScore = scored.score;
      best = scored;
    } else if (scored.score === bestScore && best) {
      const bestId = String(best.exchangeTx._id);
      const currentId = String(scored.exchangeTx._id);
      if (currentId < bestId) {
        best = scored;
      }
    }
  }

  return best;
}

function pass1HintGroups(userTxs, exchangeTxs) {
  const hints = new Map();

  for (const userTx of userTxs) {
    const userNum = extractNumeric(userTx.transactionId);
    if (userNum === null) {
      continue;
    }

    const hinted = exchangeTxs.filter((ex) => {
      const exNum = extractNumeric(ex.transactionId);
      if (exNum === null) {
        return false;
      }
      return Math.abs(userNum - exNum) <= 10;
    });

    if (hinted.length > 0) {
      hints.set(String(userTx._id), hinted);
    }
  }

  return hints;
}

function matchTransactions(userTxs, exchangeTxs, config) {
  const consumedExchangeIds = new Set();
  const results = [];

  const hints = pass1HintGroups(userTxs, exchangeTxs);
  const { exchangeByAssetType } = buildCandidatePools(userTxs, exchangeTxs);

  const sortedUserTxs = [...userTxs].sort((a, b) => {
    const aNum = extractNumeric(a.transactionId) ?? Infinity;
    const bNum = extractNumeric(b.transactionId) ?? Infinity;
    if (aNum !== bNum) {
      return aNum - bNum;
    }
    return String(a._id).localeCompare(String(b._id));
  });

  for (const userTx of sortedUserTxs) {
    let candidates = getCandidatesForUser(
      userTx,
      exchangeByAssetType,
      exchangeTxs,
      consumedExchangeIds
    );

    const hintCandidates = hints.get(String(userTx._id));
    if (hintCandidates && hintCandidates.length > 0) {
      const hintIds = new Set(hintCandidates.map((h) => String(h._id)));
      const hintedFiltered = candidates.filter((c) => hintIds.has(String(c._id)));
      if (hintedFiltered.length > 0) {
        candidates = hintedFiltered;
      }
    }

    if (candidates.length === 0) {
      results.push({
        status: MATCH_STATUS.UNMATCHED_USER,
        userTx,
        exchangeTx: null,
        conflictReason: null,
        metadata: {},
      });
      continue;
    }

    const best = selectBestCandidate(userTx, candidates, config);

    if (!best) {
      results.push({
        status: MATCH_STATUS.UNMATCHED_USER,
        userTx,
        exchangeTx: null,
        conflictReason: null,
        metadata: {},
      });
      continue;
    }

    const { exchangeTx, tsResult, qtyResult } = best;
    consumedExchangeIds.add(String(exchangeTx._id));

    const classification = classify(userTx, exchangeTx, config);

    if (classification.status === MATCH_STATUS.MATCHED) {
      const feeDelta = Math.abs((userTx.fee || 0) - (exchangeTx.fee || 0));
      if (feeDelta > 0) {
        logger.debug('Fee delta on matched pair', {
          userTransactionId: userTx.transactionId,
          exchangeTransactionId: exchangeTx.transactionId,
          feeDelta,
        });
      }
    }

    logger.info('Match decision', {
      userTransactionId: userTx.transactionId,
      exchangeTransactionId: exchangeTx.transactionId,
      status: classification.status,
      score: best.score,
      timestampSkipped: tsResult.skipped,
    });

    results.push({
      status: classification.status,
      userTx,
      exchangeTx,
      conflictReason: classification.conflictReason,
      metadata: {
        timestampSkipped: tsResult.skipped,
        timestampDeltaSeconds: tsResult.deltaSeconds,
        quantityDeltaPct: qtyResult.deltaPct,
        score: best.score,
      },
    });
  }

  for (const exchangeTx of exchangeTxs) {
    if (!consumedExchangeIds.has(String(exchangeTx._id))) {
      results.push({
        status: MATCH_STATUS.UNMATCHED_EXCHANGE,
        userTx: null,
        exchangeTx,
        conflictReason: null,
        metadata: {},
      });
    }
  }

  return results;
}

function summarizeResults(results) {
  const summary = {
    matched: 0,
    conflicting: 0,
    unmatchedUser: 0,
    unmatchedExchange: 0,
  };

  for (const r of results) {
    switch (r.status) {
      case MATCH_STATUS.MATCHED:
        summary.matched += 1;
        break;
      case MATCH_STATUS.CONFLICTING:
        summary.conflicting += 1;
        break;
      case MATCH_STATUS.UNMATCHED_USER:
        summary.unmatchedUser += 1;
        break;
      case MATCH_STATUS.UNMATCHED_EXCHANGE:
        summary.unmatchedExchange += 1;
        break;
      default:
        break;
    }
  }

  return summary;
}

module.exports = {
  matchTransactions,
  summarizeResults,
  getCandidatesForUser,
  selectBestCandidate,
  scoreCandidate,
};
