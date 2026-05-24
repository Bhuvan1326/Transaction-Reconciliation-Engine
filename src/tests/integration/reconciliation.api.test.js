const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const request = require('supertest');
const { parse } = require('csv-parse/sync');
const { RUN_STATUS, MATCH_STATUS } = require('../../utils/constants');

let app;

const fixturesDir = path.join(__dirname, '../fixtures');
const userFixture = path.join(fixturesDir, 'user_transactions.csv');
const exchangeFixture = path.join(fixturesDir, 'exchange_transactions.csv');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForCompletion(runId, maxAttempts = 50) {
  for (let i = 0; i < maxAttempts; i += 1) {
    const res = await request(app).get(`/api/v1/reconcile/${runId}`);
    if (res.body.status === RUN_STATUS.COMPLETED) {
      return res.body;
    }
    if (res.body.status === RUN_STATUS.FAILED) {
      throw new Error(`Reconciliation failed: ${JSON.stringify(res.body)}`);
    }
    await sleep(200);
  }
  throw new Error('Reconciliation did not complete in time');
}

describe('reconciliation API integration', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    app = require('../../app');
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  it('POST reconcile produces report with all four status values', async () => {
    const postRes = await request(app)
      .post('/api/v1/reconcile')
      .field('timestampToleranceSeconds', '300')
      .field('quantityTolerancePct', '0.01')
      .attach('userFile', userFixture)
      .attach('exchangeFile', exchangeFixture);

    expect(postRes.status).toBe(202);
    expect(postRes.body.runId).toBeDefined();
    expect(postRes.body.status).toBe(RUN_STATUS.RUNNING);

    const completed = await waitForCompletion(postRes.body.runId);
    expect(completed.summary.matched).toBeGreaterThan(0);

    const reportRes = await request(app).get(
      `/api/v1/reconcile/${postRes.body.runId}/report`
    );
    expect(reportRes.status).toBe(200);

    const rows = parse(reportRes.text, { columns: true, skip_empty_lines: true });
    const statuses = new Set(rows.map((r) => r.status));

    expect(statuses.has(MATCH_STATUS.MATCHED)).toBe(true);
    expect(statuses.has(MATCH_STATUS.CONFLICTING)).toBe(true);
    expect(statuses.has(MATCH_STATUS.UNMATCHED_USER)).toBe(true);
    expect(statuses.has(MATCH_STATUS.UNMATCHED_EXCHANGE)).toBe(true);
  });

  it('GET health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.uptime).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET issues returns paginated quality issues', async () => {
    const postRes = await request(app)
      .post('/api/v1/reconcile')
      .attach('userFile', userFixture)
      .attach('exchangeFile', exchangeFixture);

    await waitForCompletion(postRes.body.runId);

    const issuesRes = await request(app).get(
      `/api/v1/reconcile/${postRes.body.runId}/issues?page=1&limit=10`
    );

    expect(issuesRes.status).toBe(200);
    expect(issuesRes.body.total).toBeGreaterThan(0);
    expect(issuesRes.body.items.length).toBeGreaterThan(0);
  });
});
