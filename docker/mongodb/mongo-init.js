db = db.getSiblingDB('transaction_reconciliation');

db.createCollection('transactions');
db.createCollection('dataqualityissues');
db.createCollection('reconciliationruns');

db.transactions.createIndex({ transactionId: 1, source: 1 });
db.transactions.createIndex({ reconciliationRunId: 1 });
db.transactions.createIndex({ asset: 1, type: 1, timestamp: 1 });

db.dataqualityissues.createIndex({ reconciliationRunId: 1 });

print('MongoDB indexes created for transaction_reconciliation database');
