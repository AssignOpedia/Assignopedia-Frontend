const asyncRoute = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const required = (body, fields) => {
  const missing = fields.filter((field) => !String(body[field] || "").trim());

  if (missing.length) {
    throw createError(400, `Missing required field(s): ${missing.join(", ")}`);
  }
};

const nowIso = () => new Date().toISOString();

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

module.exports = { asyncRoute, createError, required, nowIso, makeId };
