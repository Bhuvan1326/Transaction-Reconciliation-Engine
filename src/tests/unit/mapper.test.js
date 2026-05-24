const { normalizeAsset } = require('../../utils/assetMapper');
const {
  normalizeType,
  typesMatchForReconciliation,
} = require('../../utils/typeMapper');
const { TRANSACTION_TYPES } = require('../../utils/constants');

describe('mappers', () => {
  describe('assetMapper', () => {
    it('maps bitcoin to BTC', () => {
      expect(normalizeAsset('bitcoin')).toBe('BTC');
    });

    it('uppercases known tickers', () => {
      expect(normalizeAsset('eth')).toBe('ETH');
    });

    it('passes through unknown assets uppercased', () => {
      expect(normalizeAsset('unknowncoin')).toBe('UNKNOWNCOIN');
    });
  });

  describe('typeMapper', () => {
    it('normalizes buy type', () => {
      expect(normalizeType('buy', 'user')).toBe(TRANSACTION_TYPES.BUY);
    });

    it('matches TRANSFER_OUT user with TRANSFER_IN exchange', () => {
      expect(
        typesMatchForReconciliation(
          TRANSACTION_TYPES.TRANSFER_OUT,
          TRANSACTION_TYPES.TRANSFER_IN
        )
      ).toBe(true);
    });

    it('does not match unrelated types', () => {
      expect(
        typesMatchForReconciliation(TRANSACTION_TYPES.BUY, TRANSACTION_TYPES.SELL)
      ).toBe(false);
    });
  });
});
