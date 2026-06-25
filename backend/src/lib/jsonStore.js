const fs = require("fs/promises");
const path = require("path");

const dataDir = path.join(__dirname, "..", "..", "data");
const writeQueues = new Map();

const ensureDataDir = async () => {
  await fs.mkdir(dataDir, { recursive: true });
};

const getFilePath = (name) => path.join(dataDir, `${name}.json`);

const clone = (value) => JSON.parse(JSON.stringify(value));

const read = async (name, fallback) => {
  await ensureDataDir();

  try {
    const raw = await fs.readFile(getFilePath(name), "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    await write(name, fallback);
    return clone(fallback);
  }
};

const write = async (name, data) => {
  await ensureDataDir();
  const filePath = getFilePath(name);
  const nextWrite = (writeQueues.get(name) || Promise.resolve()).then(() =>
    fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8")
  );

  writeQueues.set(name, nextWrite.catch(() => {}));
  await nextWrite;
  return data;
};

const update = async (name, fallback, updater) => {
  const current = await read(name, fallback);
  const next = await updater(current);
  await write(name, next);
  return next;
};

module.exports = { read, write, update };
