require("dotenv").config();

const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "assignopedia-api", timestamp: new Date().toISOString() });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || "Something went wrong",
  });
});

module.exports = app;
