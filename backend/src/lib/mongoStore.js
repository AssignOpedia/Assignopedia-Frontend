const { MongoClient } = require("mongodb");
const jsonStore = require("./jsonStore");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "assignopedia";
const collectionName = process.env.MONGODB_COLLECTION || "appStores";
const usersCollectionName = process.env.MONGODB_USERS_COLLECTION || "users";
const arrayCollectionStores = {
  attendance: {
    collectionName: process.env.MONGODB_ATTENDANCE_COLLECTION || "attendance",
    idPrefix: "attendance",
  },
  blogPosts: {
    collectionName: process.env.MONGODB_BLOG_POSTS_COLLECTION || "blogPosts",
    idPrefix: "blog",
  },
  cvApplications: {
    collectionName: process.env.MONGODB_CV_APPLICATIONS_COLLECTION || "cvApplications",
    idPrefix: "cv",
  },
  leaveRequests: {
    collectionName: process.env.MONGODB_LEAVE_REQUESTS_COLLECTION || "leaveRequests",
    idPrefix: "leave",
  },
  notices: {
    collectionName: process.env.MONGODB_NOTICES_COLLECTION || "notices",
    idPrefix: "notice",
  },
  wfhRequests: {
    collectionName: process.env.MONGODB_WFH_REQUESTS_COLLECTION || "wfhRequests",
    idPrefix: "wfh",
  },
};

let clientPromise;
let warnedFallback = false;

const clone = (value) => JSON.parse(JSON.stringify(value));

const getAccountId = (account) =>
  account.id || `account_${account.role || "user"}_${account.email || Date.now()}`;

const normalizeAccount = (account) => {
  const id = getAccountId(account);
  return { ...account, id, _id: id };
};

const normalizeDocument = (item, prefix) => {
  const id = item.id || `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return { ...item, id, _id: id };
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

const readLegacyArrayStore = async (name) => {
  const appStoresCollection = await getCollection(collectionName);
  const document = await appStoresCollection?.findOne({ _id: name });
  return Array.isArray(document?.data) ? document.data : null;
};

const readArrayCollection = async ({ name, fallback, targetCollectionName, idPrefix }) => {
  const data = await withStore(async (collection) => {
    const items = await collection
      .find({})
      .project({ _id: 0 })
      .sort({ createdAt: -1, updatedAt: -1 })
      .toArray();

    if (items.length > 0) {
      return items;
    }

    const legacyItems = await readLegacyArrayStore(name);
    const seededItems = clone(legacyItems?.length ? legacyItems : fallback);

    if (Array.isArray(seededItems) && seededItems.length > 0) {
      await collection.insertMany(
        seededItems.map((item) => normalizeDocument(item, idPrefix)),
        { ordered: false }
      );
    }

    return seededItems;
  }, targetCollectionName);

  return data === null ? jsonStore.read(name, fallback) : data;
};

const writeArrayCollection = async ({ name, data, targetCollectionName, idPrefix }) => {
  const saved = await withStore(async (collection) => {
    await collection.deleteMany({});

    if (Array.isArray(data) && data.length > 0) {
      await collection.insertMany(
        data.map((item) => normalizeDocument(item, idPrefix)),
        { ordered: false }
      );
    }

    return data;
  }, targetCollectionName);

  return saved === null ? jsonStore.write(name, data) : saved;
};

const read = async (name, fallback) => {
  if (name === "accounts") {
    return readUsers(fallback);
  }

  if (arrayCollectionStores[name]) {
    return readArrayCollection({
      name,
      fallback,
      targetCollectionName: arrayCollectionStores[name].collectionName,
      idPrefix: arrayCollectionStores[name].idPrefix,
    });
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

  if (arrayCollectionStores[name]) {
    return writeArrayCollection({
      name,
      data,
      targetCollectionName: arrayCollectionStores[name].collectionName,
      idPrefix: arrayCollectionStores[name].idPrefix,
    });
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
      arrayCollections: Object.fromEntries(
        Object.entries(arrayCollectionStores).map(([name, config]) => [
          name,
          config.collectionName,
        ])
      ),
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
