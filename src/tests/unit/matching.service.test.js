const { matchTransactions, selectBestCandidate } = require('../../services/matching.service');
const { MATCH_STATUS } = require('../../utils/constants');

function makeTx(overrides) {
  return {
    _id: overrides._id,
    transactionId: overrides.transactionId,
    timestamp: overrides.timestamp ?? new Date('2024-03-01T10:00:00Z'),
    type: overrides.type,
    asset: overrides.asset,
    quantity: overrides.quantity,
    priceUsd: overrides.priceUsd ?? 0,
    fee: overrides.fee ?? 0,
    note: '',
  };
}

const defaultConfig = {
  timestampToleranceSeconds: 300,
  quantityTolerancePct: 0.01,
};

describe('matching.service', () => {
  it('matches exact pairs', () => {
    const userTxs = [
      makeTx({
        _id: 'u1',
        transactionId: 'USR-001',
        type: 'BUY',
        asset: 'BTC',
        quantity: 0.5,
      }),
    ];
    const exchangeTxs = [
      makeTx({
        _id: 'e1',
        transactionId: 'EXC-1001',
        type: 'BUY',
        asset: 'BTC',
        quantity: 0.5,
        timestamp: new Date('2024-03-01T10:00:05Z'),
      }),
    ];

    const results = matchTransactions(userTxs, exchangeTxs, defaultConfig);
    const matched = results.filter((r) => r.status === MATCH_STATUS.MATCHED);
    expect(matched).toHaveLength(1);
    expect(matched[0].userTx.transactionId).toBe('USR-001');
    expect(matched[0].exchangeTx.transactionId).toBe('EXC-1001');
  });

  it('matches TRANSFER_OUT with TRANSFER_IN perspective flip', () => {
    const userTxs = [
      makeTx({
        _id: 'u1',
        transactionId: 'USR-003',
        type: 'TRANSFER_OUT',
        asset: 'BTC',
        quantity: 0.1,
        timestamp: new Date('2024-03-03T09:15:00Z'),
      }),
    ];
    const exchangeTxs = [
      makeTx({
        _id: 'e1',
        transactionId: 'EXC-1003',
        type: 'TRANSFER_IN',
        asset: 'BTC',
        quantity: 0.1,
        timestamp: new Date('2024-03-03T09:15:03Z'),
      }),
    ];

    const results = matchTransactions(userTxs, exchangeTxs, defaultConfig);
    expect(results.some((r) => r.status === MATCH_STATUS.MATCHED)).toBe(true);
  });

  it('matches at quantity tolerance boundary', () => {
    const userTxs = [
      makeTx({
        _id: 'u1',
        transactionId: 'USR-005',
        type: 'BUY',
        asset: 'BTC',
        quantity: 0.2,
        timestamp: new Date('2024-03-05T08:00:00Z'),
      }),
    ];
    const exchangeTxs = [
      makeTx({
        _id: 'e1',
        transactionId: 'EXC-1005',
        type: 'BUY',
        asset: 'BTC',
        quantity: 0.20002,
        timestamp: new Date('2024-03-05T08:00:02Z'),
      }),
    ];

    const results = matchTransactions(userTxs, exchangeTxs, defaultConfig);
    expect(results[0].status).toBe(MATCH_STATUS.MATCHED);
  });

  it('classifies conflicting when quantity exceeds tolerance', () => {
    const userTxs = [
      makeTx({
        _id: 'u1',
        transactionId: 'USR-011',
        type: 'SELL',
        asset: 'ETH',
        quantity: 5.0,
        timestamp: new Date('2024-03-07T10:00:00Z'),
      }),
    ];
    const exchangeTxs = [
      makeTx({
        _id: 'e1',
        transactionId: 'EXC-1012',
        type: 'SELL',
        asset: 'ETH',
        quantity: 5.5,
        timestamp: new Date('2024-03-07T10:05:00Z'),
      }),
    ];

    const results = matchTransactions(userTxs, exchangeTxs, defaultConfig);
    const conflicting = results.find((r) => r.status === MATCH_STATUS.CONFLICTING);
    expect(conflicting).toBeDefined();
    expect(conflicting.conflictReason).toContain('quantity_delta');
  });

  it('breaks ties deterministically by lowest weighted distance then id', () => {
    const userTx = makeTx({
      _id: 'u1',
      transactionId: 'USR-010',
      type: 'BUY',
      asset: 'BTC',
      quantity: 1.0,
      timestamp: new Date('2024-03-06T10:00:00Z'),
    });

    const candidates = [
      makeTx({
        _id: 'e2',
        transactionId: 'EXC-1011',
        type: 'BUY',
        asset: 'BTC',
        quantity: 1.0,
        timestamp: new Date('2024-03-06T10:00:02Z'),
      }),
      makeTx({
        _id: 'e1',
        transactionId: 'EXC-1010',
        type: 'BUY',
        asset: 'BTC',
        quantity: 1.0,
        timestamp: new Date('2024-03-06T10:00:01Z'),
      }),
    ];

    const best = selectBestCandidate(userTx, candidates, defaultConfig);
    expect(best.exchangeTx._id).toBe('e1');
  });

  it('returns unmatched when no candidate exists', () => {
    const userTxs = [
      makeTx({
        _id: 'u1',
        transactionId: 'USR-999',
        type: 'BUY',
        asset: 'DOGE',
        quantity: 100,
      }),
    ];
    const exchangeTxs = [
      makeTx({
        _id: 'e1',
        transactionId: 'EXC-999',
        type: 'SELL',
        asset: 'BTC',
        quantity: 1,
      }),
    ];

    const results = matchTransactions(userTxs, exchangeTxs, defaultConfig);
    expect(results.some((r) => r.status === MATCH_STATUS.UNMATCHED_USER)).toBe(true);
    expect(results.some((r) => r.status === MATCH_STATUS.UNMATCHED_EXCHANGE)).toBe(true);
  });
});
