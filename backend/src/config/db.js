const { MongoClient } = require("mongodb");
const dns = require("node:dns");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "assignopedia";
const dnsServers = (process.env.MONGODB_DNS_SERVERS || "8.8.8.8,1.1.1.1")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

let clientPromise;
const mongoTimeoutMs = Number(process.env.MONGODB_TIMEOUT_MS || 15000);

if (dnsServers.length > 0) {
  dns.setServers(dnsServers);
}

const timeout = (ms, message) =>
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });

const withTimeout = (promise, message) => Promise.race([promise, timeout(mongoTimeoutMs, message)]);

const getClient = async () => {
  if (!uri) {
    return null;
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      connectTimeoutMS: mongoTimeoutMs,
      serverSelectionTimeoutMS: mongoTimeoutMs,
    });
    clientPromise = client.connect();
  }

  return withTimeout(clientPromise, "MongoDB connection timed out");
};

const resetClient = () => {
  clientPromise = null;
};

const getDb = async () => {
  const client = await getClient();
  return client?.db(dbName) || null;
};

module.exports = { dbName, getClient, getDb, resetClient, uri, withTimeout };
