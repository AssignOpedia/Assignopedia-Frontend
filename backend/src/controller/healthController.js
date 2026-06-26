const store = require("../model/appStore");

const getHealth = async (req, res) => {
  res.json({
    ok: true,
    service: "assignopedia-api",
    database: await store.getStatus(),
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth };
