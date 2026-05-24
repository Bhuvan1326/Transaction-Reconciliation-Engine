const {
  timestampWithinTolerance,
  quantityWithinTolerance,
} = require('../../utils/tolerance');

describe('tolerance', () => {
  describe('timestampWithinTolerance', () => {
    const userTs = new Date('2024-03-01T10:00:00Z');
    const exchangeTs = new Date('2024-03-01T10:02:00Z');

    it('returns within true when delta is within tolerance', () => {
      const result = timestampWithinTolerance(userTs, exchangeTs, 300);
      expect(result.within).toBe(true);
      expect(result.deltaSeconds).toBe(120);
      expect(result.skipped).toBe(false);
    });

    it('returns within false at boundary breach', () => {
      const exchangeBoundary = new Date('2024-03-01T10:05:01Z');
      const result = timestampWithinTolerance(userTs, exchangeBoundary, 300);
      expect(result.within).toBe(false);
      expect(result.deltaSeconds).toBeGreaterThan(300);
    });

    it('returns within true at exact boundary', () => {
      const exchangeBoundary = new Date('2024-03-01T10:05:00Z');
      const result = timestampWithinTolerance(userTs, exchangeBoundary, 300);
      expect(result.within).toBe(true);
      expect(result.deltaSeconds).toBe(300);
    });

    it('skips check when user timestamp is null', () => {
      const result = timestampWithinTolerance(null, exchangeTs, 300);
      expect(result.within).toBe(true);
      expect(result.skipped).toBe(true);
      expect(result.deltaSeconds).toBeNull();
    });

    it('skips check when exchange timestamp is null', () => {
      const result = timestampWithinTolerance(userTs, null, 300);
      expect(result.within).toBe(true);
      expect(result.skipped).toBe(true);
    });

    it('handles zero delta', () => {
      const result = timestampWithinTolerance(userTs, userTs, 300);
      expect(result.within).toBe(true);
      expect(result.deltaSeconds).toBe(0);
    });
  });

  describe('quantityWithinTolerance', () => {
    it('returns within true for zero delta', () => {
      const result = quantityWithinTolerance(1.0, 1.0, 0.01);
      expect(result.within).toBe(true);
      expect(result.deltaPct).toBe(0);
    });

    it('returns within true within tolerance percentage', () => {
      const result = quantityWithinTolerance(0.20002, 0.2, 0.01);
      expect(result.within).toBe(true);
      expect(result.deltaPct).toBeLessThanOrEqual(0.01);
    });

    it('returns within false when delta exceeds tolerance', () => {
      const result = quantityWithinTolerance(5.5, 5.0, 0.01);
      expect(result.within).toBe(false);
      expect(result.deltaPct).toBe(10);
    });

    it('handles zero exchange quantity', () => {
      const bothZero = quantityWithinTolerance(0, 0, 0.01);
      expect(bothZero.within).toBe(true);

      const userNonZero = quantityWithinTolerance(1, 0, 0.01);
      expect(userNonZero.within).toBe(false);
    });
  });
});
