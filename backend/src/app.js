require("dotenv").config();

const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { getHealth } = require("./controller/healthController");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();
const clientOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.replace(/\/$/, "");

  return (
    clientOrigins.includes(normalizedOrigin) ||
    /^http:\/\/localhost:\d+$/.test(normalizedOrigin) ||
    /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(normalizedOrigin)
  );
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);
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
