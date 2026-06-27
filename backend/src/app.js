require("dotenv").config();

const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { getHealth } = require("./controller/healthController");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "assignopedia-api",
    health: "/api/health",
  });
});

app.get("/healthz", getHealth);
app.get("/api/health", getHealth);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
