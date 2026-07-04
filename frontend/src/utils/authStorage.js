import { createApiResourceStore } from "./apiResourceStore";

const currentUserEvent = "assignopedia-current-user-updated";
const currentUserSessionKey = "assignopediaCurrentUser";

const fallbackEmployee = {
  name: "Employee",
  email: "employee@assignopedia.com",
  role: "employee",
};

const defaultAccounts = [
  { id: "account-admin", name: "Raj Da", email: "raj.admin@assignopedia.com", password: "admin123", role: "admin" },
  { id: "account-hr", name: "HR Admin", email: "hr@assignopedia.com", password: "hr123", role: "hr" },
  { id: "account-employee", name: "Employee", email: "employee@assignopedia.com", password: "employee123", role: "employee" },
];

const accountStore = createApiResourceStore({
  resource: "accounts",
  event: currentUserEvent,
  fallback: defaultAccounts,
});

const readSessionUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem(currentUserSessionKey)) || fallbackEmployee;
  } catch {
    return fallbackEmployee;
  }
};

let currentUser = typeof window === "undefined" ? fallbackEmployee : readSessionUser();

const readAccounts = () => accountStore.get();

const saveAccounts = (accounts) => {
  accountStore.save(accounts).catch(() => {});
};

export const registerAccount = ({ name, email, password, role }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = readAccounts();
  const emailAlreadyRegistered = accounts.some(
    (account) => account.email === normalizedEmail && account.role === role
  );

  if (emailAlreadyRegistered) {
    return null;
  }

  const account = {
    id: `account-${role}-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
  };

  saveAccounts([...accounts, account]);
  setCurrentUser(account);
  return account;
};

export const loginAccount = ({ email, password, role }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const account = readAccounts().find(
    (savedAccount) =>
      savedAccount.email === normalizedEmail &&
      savedAccount.password === password &&
      savedAccount.role === role
  );

  if (account) {
    setCurrentUser(account);
    return account;
  }

  return null;
};

export const findAccountByEmail = (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  return readAccounts().find((account) => account.email === normalizedEmail) || null;
};

export const updateAccountPassword = ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = readAccounts();
  const nextAccounts = accounts.map((account) =>
    account.email === normalizedEmail ? { ...account, password } : account
  );
  const updatedAccount = nextAccounts.find((account) => account.email === normalizedEmail) || null;

  if (updatedAccount) {
    saveAccounts(nextAccounts);
  }

  return updatedAccount;
};

export const updateCurrentUserProfile = ({ name, email }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = readAccounts();
  const nextAccounts = accounts.map((account) =>
    account.email === currentUser.email && account.role === currentUser.role
      ? { ...account, name: name.trim(), email: normalizedEmail }
      : account
  );

  saveAccounts(nextAccounts);

  const updatedUser = {
    ...currentUser,
    name: name.trim(),
    email: normalizedEmail,
  };

  setCurrentUser(updatedUser);
  return updatedUser;
};

export const getCurrentUser = () => currentUser;

export const setCurrentUser = (user) => {
  const publicUser = {
    name: user.name,
    email: user.email,
    role: user.role,
  };

  currentUser = publicUser;
  sessionStorage.setItem(currentUserSessionKey, JSON.stringify(publicUser));
  window.dispatchEvent(new CustomEvent(currentUserEvent, { detail: publicUser }));
};

export const rememberRegisteredAccount = (account) => {
  const accounts = readAccounts();
  const normalizedEmail = account.email?.trim().toLowerCase();
  const nextAccount = {
    ...account,
    email: normalizedEmail,
    role: account.role?.trim().toLowerCase(),
  };
  const exists = accounts.some((savedAccount) => savedAccount.email === normalizedEmail);

  if (exists) {
    accountStore.setLocal(
      accounts.map((savedAccount) =>
        savedAccount.email === normalizedEmail ? { ...savedAccount, ...nextAccount } : savedAccount
      )
    );
    return nextAccount;
  }

  accountStore.setLocal([...accounts, nextAccount]);
  return nextAccount;
};

export const clearCurrentUser = () => {
  currentUser = fallbackEmployee;
  sessionStorage.removeItem(currentUserSessionKey);
  window.dispatchEvent(new CustomEvent(currentUserEvent, { detail: currentUser }));
};

export const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "EM";

export { currentUserEvent };
