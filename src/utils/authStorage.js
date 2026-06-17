const accountsKey = "assignopediaAccounts";
const currentUserKey = "assignopediaCurrentUser";
const currentUserEvent = "assignopedia-current-user-updated";

const fallbackEmployee = {
  name: "Employee",
  email: "employee@assignopedia.com",
  role: "employee",
};

const readAccounts = () => {
  try {
    return JSON.parse(localStorage.getItem(accountsKey)) || [];
  } catch {
    return [];
  }
};

const saveAccounts = (accounts) => {
  localStorage.setItem(accountsKey, JSON.stringify(accounts));
};

export const registerAccount = ({ name, email, password, role }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = readAccounts();
  const emailAlreadyRegistered = accounts.some(
    (account) => account.email === normalizedEmail
  );

  if (emailAlreadyRegistered) {
    return null;
  }

  const account = {
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
  };

  accounts.push(account);
  saveAccounts(accounts);
  setCurrentUser(account);
  return account;
};

export const loginAccount = ({ email, password, role }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = readAccounts();
  const account = accounts.find(
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
  const accounts = readAccounts();

  return accounts.find((account) => account.email === normalizedEmail) || null;
};

export const updateAccountPassword = ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = readAccounts();
  const accountIndex = accounts.findIndex(
    (account) => account.email === normalizedEmail
  );

  if (accountIndex < 0) {
    return null;
  }

  accounts[accountIndex] = {
    ...accounts[accountIndex],
    password,
  };

  saveAccounts(accounts);
  return accounts[accountIndex];
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(currentUserKey)) || fallbackEmployee;
  } catch {
    return fallbackEmployee;
  }
};

export const setCurrentUser = (user) => {
  const publicUser = {
    name: user.name,
    email: user.email,
    role: user.role,
  };

  localStorage.setItem(currentUserKey, JSON.stringify(publicUser));
  window.dispatchEvent(new CustomEvent(currentUserEvent, { detail: publicUser }));
};

export const getInitials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "EM";

export { currentUserEvent };
