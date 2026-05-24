const { TRANSACTION_TYPES, PERSPECTIVE_FLIP } = require('./constants');

const TYPE_ALIASES = {
  buy: TRANSACTION_TYPES.BUY,
  sell: TRANSACTION_TYPES.SELL,
  transfer_in: TRANSACTION_TYPES.TRANSFER_IN,
  transfer_out: TRANSACTION_TYPES.TRANSFER_OUT,
  deposit: TRANSACTION_TYPES.DEPOSIT,
  withdrawal: TRANSACTION_TYPES.WITHDRAWAL,
};

function normalizeType(type, source) {
  if (type === null || type === undefined || type === '') {
    return '';
  }

  const trimmed = String(type).trim();
  if (!trimmed) {
    return '';
  }

  const aliasKey = trimmed.toLowerCase();
  let normalized = TYPE_ALIASES[aliasKey] || trimmed.toUpperCase();

  if (source === 'user' && normalized === TRANSACTION_TYPES.TRANSFER_OUT) {
    return TRANSACTION_TYPES.TRANSFER_OUT;
  }

  return normalized;
}

function typesMatchForReconciliation(userType, exchangeType) {
  if (userType === exchangeType) {
    return true;
  }

  if (
    userType === TRANSACTION_TYPES.TRANSFER_OUT &&
    exchangeType === TRANSACTION_TYPES.TRANSFER_IN
  ) {
    return true;
  }

  if (
    userType === TRANSACTION_TYPES.TRANSFER_IN &&
    exchangeType === TRANSACTION_TYPES.TRANSFER_OUT
  ) {
    return true;
  }

  return false;
}

function getExchangeMatchType(userType) {
  if (userType === TRANSACTION_TYPES.TRANSFER_OUT) {
    return TRANSACTION_TYPES.TRANSFER_IN;
  }
  if (userType === TRANSACTION_TYPES.TRANSFER_IN) {
    return TRANSACTION_TYPES.TRANSFER_OUT;
  }
  return userType;
}

module.exports = {
  normalizeType,
  typesMatchForReconciliation,
  getExchangeMatchType,
  TYPE_ALIASES,
};
