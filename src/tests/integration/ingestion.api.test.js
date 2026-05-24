const path = require('path');
const mongoose = require('mongoose');
const ingestionService = require('../../services/ingestion.service');
const transactionRepository = require('../../repositories/transaction.repository');
const qualityIssueRepository = require('../../repositories/qualityIssue.repository');
const ReconciliationRun = require('../../models/ReconciliationRun');
const { SOURCES, SEVERITY, QUALITY_REASONS } = require('../../utils/constants');

describe('ingestion integration', () => {
  let runId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
    const run = await ReconciliationRun.create({
      config: { timestampToleranceSeconds: 300, quantityTolerancePct: 0.01 },
    });
    runId = run._id;
  });

  it('persists all rows including bad rows and flags quality issues', async () => {
    const userFixture = path.join(__dirname, '../fixtures/user_transactions.csv');
    const insertManySpy = jest.spyOn(transactionRepository, 'insertMany');
    const issueInsertSpy = jest.spyOn(qualityIssueRepository, 'insertMany');

    await ingestionService.ingestFile(userFixture, SOURCES.USER, runId);

    const transactions = await transactionRepository.findByRun(runId);
    expect(transactions.length).toBe(12);

    const issues = await qualityIssueRepository.findByRun(runId, { limit: 100 });
    expect(issues.total).toBeGreaterThan(0);

    const duplicateWarnings = issues.items.filter(
      (i) => i.reason === QUALITY_REASONS.DUPLICATE_TRANSACTION_ID
    );
    expect(duplicateWarnings.length).toBeGreaterThanOrEqual(1);
    expect(duplicateWarnings[0].severity).toBe(SEVERITY.WARNING);

    const negativeQtyErrors = issues.items.filter(
      (i) => i.reason === QUALITY_REASONS.INVALID_QUANTITY
    );
    expect(negativeQtyErrors.length).toBeGreaterThanOrEqual(1);

    expect(insertManySpy).toHaveBeenCalled();
    expect(issueInsertSpy).toHaveBeenCalled();

    insertManySpy.mockRestore();
    issueInsertSpy.mockRestore();
  });
});
