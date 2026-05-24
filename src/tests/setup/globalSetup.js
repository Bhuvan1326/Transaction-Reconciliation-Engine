const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async function globalSetup() {
  const mongoServer = await MongoMemoryServer.create({
    binary: { version: '6.0.16' },
    instance: {
      launchTimeout: 120000,
    },
  });
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = 'test';
  global.__MONGOSERVER__ = mongoServer;
};
