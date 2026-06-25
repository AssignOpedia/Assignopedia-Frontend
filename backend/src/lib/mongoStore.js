const { MongoClient } = require("mongodb");
const jsonStore = require("./jsonStore");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "assignopedia";
const collectionName = process.env.MONGODB_COLLECTION || "appStores";
const usersCollectionName = process.env.MONGODB_USERS_COLLECTION || "users";

let clientPromise;
let warnedFallback = false;

const clone = (value) => JSON.parse(JSON.stringify(value));

const getAccountId = (account) =>
  account.id || `account_${account.role || "user"}_${account.email || Date.now()}`;

const normalizeAccount = (account) => {
  const id = getAccountId(account);
  return { ...account, id, _id: id };
};

const timeout = (ms, message) =>
  new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });

const withTimeout = (promise, message) => Promise.race([promise, timeout(5000, message)]);

const getDb = async () => {
  if (!uri) {
    return null;
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    clientPromise = client.connect();
  }

  const client = await withTimeout(clientPromise, "MongoDB connection timed out");
  return client.db(dbName);
};

const getCollection = async (targetCollectionName = collectionName) => {
  const db = await getDb();
  return db?.collection(targetCollectionName) || null;
};

const withStore = async (operation, targetCollectionName = collectionName) => {
  try {
    const collection = await getCollection(targetCollectionName);

    if (!collection) {
      return null;
    }

    return await operation(collection);
  } catch (error) {
    clientPromise = null;

    if (!warnedFallback) {
      warnedFallback = true;
      console.warn(
        `MongoDB storage unavailable. Falling back to JSON files. ${error.message}`
      );
    }

    return null;
  }
};

const seedUsers = async (collection, fallback) => {
  const seededUsers = clone(fallback);

  if (Array.isArray(seededUsers) && seededUsers.length > 0) {
    await collection.insertMany(
      seededUsers.map((account) => ({
        ...normalizeAccount(account),
        createdAt: account.createdAt ? new Date(account.createdAt) : new Date(),
        updatedAt: account.updatedAt ? new Date(account.updatedAt) : new Date(),
      })),
      { ordered: false }
    );
  }

  return seededUsers;
};

const readLegacyAccounts = async () => {
  const appStoresCollection = await getCollection(collectionName);
  const document = await appStoresCollection?.findOne({ _id: "accounts" });
  return Array.isArray(document?.data) ? document.data : null;
};

const readUsers = async (fallback) => {
  const data = await withStore(async (collection) => {
    await collection.createIndex({ email: 1, role: 1 }, { unique: true });

    const users = await collection
      .find({})
      .project({ _id: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    if (users.length > 0) {
      return users;
    }

    const legacyAccounts = await readLegacyAccounts();
    return seedUsers(collection, legacyAccounts?.length ? legacyAccounts : fallback);
  }, usersCollectionName);

  return data === null ? jsonStore.read("accounts", fallback) : data;
};

const writeUsers = async (data) => {
  const saved = await withStore(async (collection) => {
    await collection.createIndex({ email: 1, role: 1 }, { unique: true });
    await collection.deleteMany({});

    if (Array.isArray(data) && data.length > 0) {
      await collection.insertMany(
        data.map((account) => ({
          ...normalizeAccount(account),
          updatedAt: account.updatedAt ? new Date(account.updatedAt) : new Date(),
        })),
        { ordered: false }
      );
    }

    return data;
  }, usersCollectionName);

  return saved === null ? jsonStore.write("accounts", data) : saved;
};

const read = async (name, fallback) => {
  if (name === "accounts") {
    return readUsers(fallback);
  }

  const data = await withStore(async (collection) => {
    const document = await collection.findOne({ _id: name });

    if (document) {
      return document.data;
    }

    const seeded = clone(fallback);
    await collection.insertOne({
      _id: name,
      data: seeded,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return seeded;
  });

  return data === null ? jsonStore.read(name, fallback) : data;
};

const write = async (name, data) => {
  if (name === "accounts") {
    return writeUsers(data);
  }

  const saved = await withStore(async (collection) => {
    await collection.updateOne(
      { _id: name },
      {
        $set: {
          data,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    return data;
  });

  return saved === null ? jsonStore.write(name, data) : saved;
};

const update = async (name, fallback, updater) => {
  const current = await read(name, fallback);
  const next = await updater(current);
  await write(name, next);
  return next;
};

const getStatus = async () => {
  if (!uri) {
    return { provider: "json", connected: false };
  }

  try {
    const db = await getDb();
    await withTimeout(db.command({ ping: 1 }), "MongoDB ping timed out");

    return {
      provider: "mongodb",
      connected: true,
      dbName,
      collectionName,
      usersCollectionName,
    };
  } catch (error) {
    clientPromise = null;

    return {
      provider: "mongodb",
      connected: false,
      fallback: "json",
      message: error.message,
    };
  }
};

module.exports = { read, write, update, getStatus };
