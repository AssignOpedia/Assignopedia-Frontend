const jsonStore = require("./jsonStore");
const { dbName, getDb, resetClient, uri, withTimeout } = require("../config/db");

const collectionName = process.env.MONGODB_COLLECTION || "appStores";
const usersCollectionName = process.env.MONGODB_USERS_COLLECTION || "users";
const requireMongoConnection = process.env.MONGODB_REQUIRE_CONNECTION === "true";
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
  employees: {
    collectionName: process.env.MONGODB_EMPLOYEES_COLLECTION || "employees",
    idPrefix: "employee",
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

let warnedFallback = false;

const clone = (value) => JSON.parse(JSON.stringify(value));

const getAccountId = (account) =>
  account.id || `account_${account.role || "user"}_${account.email || Date.now()}`;

const normalizeAccount = (account) => {
  const id = getAccountId(account);
  return {
    ...account,
    id,
    _id: id,
    email: String(account.email || "").trim().toLowerCase(),
    role: String(account.role || "").trim().toLowerCase(),
  };
};

const getAccountUniqueKey = (account) => `${account.role}:${account.email}`;

const uniqueAccountsByEmailAndRole = (accounts = []) => {
  const seenAccounts = new Set();

  return accounts
    .map(normalizeAccount)
    .filter((account) => {
      const key = getAccountUniqueKey(account);

      if (!account.email || !account.role || seenAccounts.has(key)) {
        return false;
      }

      seenAccounts.add(key);
      return true;
    });
};

const normalizeDocument = (item, prefix) => {
  const id = item.id || `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return { ...item, id, _id: id };
};

const getCollection = async (targetCollectionName = collectionName) => {
  const db = await getDb();
  return db?.collection(targetCollectionName) || null;
};

const withStore = async (operation, targetCollectionName = collectionName) => {
  try {
    const collection = await getCollection(targetCollectionName);

    if (!collection) {
      if (requireMongoConnection) {
        throw new Error("MongoDB connection is required but MONGODB_URI is not configured");
      }

      return null;
    }

    return await operation(collection);
  } catch (error) {
    resetClient();

    if (!warnedFallback) {
      warnedFallback = true;
      console.warn(
        requireMongoConnection
          ? `MongoDB storage unavailable. ${error.message}`
          : `MongoDB storage unavailable. Falling back to JSON files. ${error.message}`
      );
    }

    if (requireMongoConnection) {
      throw error;
    }

    return null;
  }
};

const seedUsers = async (collection, fallback) => {
  const seededUsers = uniqueAccountsByEmailAndRole(clone(fallback));

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

let legacyUserMigrationComplete = false;

const migrateLegacyUsers = async (collection, fallback) => {
  if (legacyUserMigrationComplete) {
    return;
  }

  const legacyStoreAccounts = await readLegacyAccounts();
  const legacyJsonAccounts = (await jsonStore.read("accounts", [])) || [];
  const legacyAccounts = uniqueAccountsByEmailAndRole([
    ...(legacyStoreAccounts || []),
    ...(legacyJsonAccounts || []),
    ...(fallback || []),
  ]);

  for (const account of legacyAccounts) {
    await collection.updateOne(
      { email: account.email, role: account.role },
      {
        $setOnInsert: {
          ...normalizeAccount(account),
          createdAt: account.createdAt ? new Date(account.createdAt) : new Date(),
          updatedAt: account.updatedAt ? new Date(account.updatedAt) : new Date(),
        },
      },
      { upsert: true }
    );
  }

  legacyUserMigrationComplete = true;
};

const readUsers = async (fallback) => {
  const data = await withStore(async (collection) => {
    await collection.dropIndex("email_1").catch(() => {});
    await collection.createIndex({ email: 1, role: 1 }, { unique: true });

    await migrateLegacyUsers(collection, fallback);

    const users = await collection
      .find({})
      .project({ _id: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return users.length > 0 ? users : seedUsers(collection, fallback);
  }, usersCollectionName);

  const accounts = data === null ? await jsonStore.read("accounts", fallback) : data;
  return uniqueAccountsByEmailAndRole(accounts);
};

const writeUsers = async (data) => {
  const saved = await withStore(async (collection) => {
    await collection.dropIndex("email_1").catch(() => {});
    await collection.createIndex({ email: 1, role: 1 }, { unique: true });
    await collection.deleteMany({});
    const uniqueUsers = uniqueAccountsByEmailAndRole(data);

    if (uniqueUsers.length > 0) {
      await collection.insertMany(
        uniqueUsers.map((account) => ({
          ...account,
          updatedAt: account.updatedAt ? new Date(account.updatedAt) : new Date(),
        })),
        { ordered: false }
      );
    }

    return uniqueUsers;
  }, usersCollectionName);

  return saved === null ? jsonStore.write("accounts", uniqueAccountsByEmailAndRole(data)) : saved;
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
    const nextData = Array.isArray(data) ? data : [];

    await collection.deleteMany({});

    if (Array.isArray(nextData) && nextData.length > 0) {
      await collection.insertMany(
        nextData.map((item) => normalizeDocument(item, idPrefix)),
        { ordered: false }
      );
    }

    return nextData;
  }, targetCollectionName);

  if (saved !== null) {
    return saved;
  }

  return jsonStore.write(name, Array.isArray(data) ? data : []);
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
    resetClient();

    return {
      provider: "mongodb",
      connected: false,
      fallback: requireMongoConnection ? null : "json",
      required: requireMongoConnection,
      message: error.message,
    };
  }
};

module.exports = { read, write, update, getStatus };
