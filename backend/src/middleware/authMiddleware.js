const store = require("../model/appStore");
const defaults = require("../data/defaults");
const { createError, required } = require("../utils/http");

const allowedRoles = new Set(["admin", "hr", "employee"]);

const normalizeAuthBody = (req, requiredFields) => {
  required(req.body, requiredFields);

  const email = String(req.body.email || "").trim().toLowerCase();
  const role = String(req.body.role || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const name = String(req.body.name || "").trim();

  if (!email || !email.includes("@")) {
    throw createError(400, "A valid email address is required.");
  }

  if (!allowedRoles.has(role)) {
    throw createError(400, "Role must be admin, hr, or employee.");
  }

  if (!password) {
    throw createError(400, "Password is required.");
  }

  req.authBody = { email, role, password, name };
};

const loadAccounts = async (req, _res, next) => {
  try {
    req.accounts = await store.read("accounts", defaults.accounts);
    next();
  } catch (error) {
    next(error);
  }
};

const validateRegister = (req, _res, next) => {
  try {
    normalizeAuthBody(req, ["name", "email", "password", "role"]);

    if (!req.authBody.name) {
      throw createError(400, "Full name is required.");
    }

    next();
  } catch (error) {
    next(error);
  }
};

const rejectDuplicateEmail = (req, _res, next) => {
  const exists = req.accounts.some(
    (account) => account.email === req.authBody.email && account.role === req.authBody.role
  );

  if (exists) {
    next(createError(409, "This email is already registered for this portal. Please login instead."));
    return;
  }

  next();
};

const validateLogin = (req, _res, next) => {
  try {
    normalizeAuthBody(req, ["email", "password", "role"]);
    next();
  } catch (error) {
    next(error);
  }
};

const requireMatchingAccount = (req, _res, next) => {
  const account = req.accounts.find(
    (item) =>
      item.email === req.authBody.email &&
      item.password === req.authBody.password &&
      item.role === req.authBody.role
  );

  if (!account) {
    next(createError(401, "Invalid email, password, or role."));
    return;
  }

  req.account = account;
  next();
};

module.exports = {
  loadAccounts,
  rejectDuplicateEmail,
  requireMatchingAccount,
  validateLogin,
  validateRegister,
};
