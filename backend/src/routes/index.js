const express = require("express");
const store = require("../lib/mongoStore");
const { asyncRoute, createError, makeId, nowIso, required } = require("../lib/http");
const { sendMail } = require("../lib/mailer");
const defaults = require("../data/defaults");

const router = express.Router();

const syncStores = {
  accounts: { storeName: "accounts", fallback: defaults.accounts },
  adminEmployees: { storeName: "adminEmployees", fallback: defaults.adminEmployees },
  attendance: { storeName: "attendance", fallback: defaults.attendance },
  blogPosts: { storeName: "blogPosts", fallback: defaults.blogPosts },
  contactSubmissions: { storeName: "contactSubmissions", fallback: defaults.contactSubmissions },
  cvApplications: { storeName: "cvApplications", fallback: defaults.cvApplications },
  departments: { storeName: "departments", fallback: defaults.departments },
  employeeNotifications: { storeName: "employeeNotifications", fallback: defaults.employeeNotifications },
  employees: { storeName: "employees", fallback: defaults.employees },
  hrNotifications: { storeName: "hrNotifications", fallback: defaults.hrNotifications },
  leaveRequests: { storeName: "leaveRequests", fallback: defaults.leaveRequests },
  notices: { storeName: "notices", fallback: defaults.notices },
  passwordResetRequests: { storeName: "passwordResetRequests", fallback: defaults.passwordResetRequests },
  profiles: { storeName: "profiles", fallback: defaults.profiles },
  revenue: { storeName: "revenue", fallback: defaults.revenue },
  reports: { storeName: "reports", fallback: defaults.reports },
  settings: { storeName: "settings", fallback: defaults.settings },
  systemEvents: { storeName: "systemEvents", fallback: defaults.systemEvents },
  tasks: { storeName: "tasks", fallback: defaults.tasks },
  team: { storeName: "team", fallback: defaults.team },
  wfhRequests: { storeName: "wfhRequests", fallback: defaults.wfhRequests },
};

const publicAccount = (account) => {
  if (!account) {
    return null;
  }

  const { password: _password, ...safeAccount } = account;
  return safeAccount;
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

router.get("/sync/:resource", asyncRoute(async (req, res) => {
  const target = syncStores[req.params.resource];

  if (!target) {
    throw createError(404, "Sync resource not found");
  }

  res.json(await store.read(target.storeName, target.fallback));
}));

router.put("/sync/:resource", asyncRoute(async (req, res) => {
  const target = syncStores[req.params.resource];

  if (!target) {
    throw createError(404, "Sync resource not found");
  }

  const data = await store.write(target.storeName, req.body);
  res.json(data);
}));

const collectionRoute = ({ path, storeName, fallback, idPrefix, requiredFields = [] }) => {
  router.get(path, asyncRoute(async (req, res) => {
    res.json(await store.read(storeName, fallback));
  }));

  router.post(path, asyncRoute(async (req, res) => {
    required(req.body, requiredFields);
    const item = {
      id: req.body.id || makeId(idPrefix),
      ...req.body,
      createdAt: req.body.createdAt || nowIso(),
      updatedAt: nowIso(),
    };
    const items = await store.update(storeName, fallback, (current) => [item, ...current]);
    res.status(201).json({ item, items });
  }));

  router.put(`${path}/:id`, asyncRoute(async (req, res) => {
    let updatedItem = null;
    const items = await store.update(storeName, fallback, (current) =>
      current.map((item) => {
        if (item.id !== req.params.id) {
          return item;
        }

        updatedItem = { ...item, ...req.body, id: item.id, updatedAt: nowIso() };
        return updatedItem;
      })
    );

    if (!updatedItem) {
      throw createError(404, "Item not found");
    }

    res.json({ item: updatedItem, items });
  }));

  router.delete(`${path}/:id`, asyncRoute(async (req, res) => {
    const current = await store.read(storeName, fallback);
    const exists = current.some((item) => item.id === req.params.id);

    if (!exists) {
      throw createError(404, "Item not found");
    }

    const items = await store.write(storeName, current.filter((item) => item.id !== req.params.id));
    res.json({ id: req.params.id, items });
  }));
};

router.post("/auth/register", asyncRoute(async (req, res) => {
  required(req.body, ["name", "email", "password", "role"]);
  const email = req.body.email.trim().toLowerCase();
  const role = req.body.role.trim().toLowerCase();
  const accounts = await store.read("accounts", defaults.accounts);
  const exists = accounts.some((account) => account.email === email && account.role === role);

  if (exists) {
    throw createError(409, "Email is already registered for this role");
  }

  const account = {
    id: makeId("account"),
    name: req.body.name.trim(),
    email,
    password: req.body.password,
    role,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  await store.write("accounts", [...accounts, account]);
  res.status(201).json({ user: publicAccount(account) });
}));

router.post("/auth/login", asyncRoute(async (req, res) => {
  required(req.body, ["email", "password", "role"]);
  const email = req.body.email.trim().toLowerCase();
  const role = req.body.role.trim().toLowerCase();
  const accounts = await store.read("accounts", defaults.accounts);
  const account = accounts.find(
    (item) => item.email === email && item.password === req.body.password && item.role === role
  );

  if (!account) {
    throw createError(401, "Invalid email, password, or role");
  }

  res.json({ user: publicAccount(account) });
}));

router.post("/auth/forgot-password", asyncRoute(async (req, res) => {
  required(req.body, ["email", "role"]);
  const email = req.body.email.trim().toLowerCase();
  const role = req.body.role.trim().toLowerCase();

  if (!["hr", "admin"].includes(role)) {
    throw createError(400, "Email OTP reset is available for HR and Admin accounts.");
  }

  const accounts = await store.read("accounts", defaults.accounts);
  const account = accounts.find((item) => item.email === email && item.role === role);

  if (!account) {
    throw createError(404, "No registered account found with this email and role.");
  }

  const otp = generateOtp();
  const request = {
    id: makeId("password-reset"),
    name: account.name,
    email,
    role,
    otp,
    status: "Pending",
    requestedAt: new Date().toLocaleString(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    createdAt: nowIso(),
  };
  await store.update("passwordResetRequests", defaults.passwordResetRequests, (current) => [
    request,
    ...current,
  ]);
  const mail = await sendMail({
    to: email,
    subject: "Assignopedia password reset OTP",
    text: `Hello ${account.name},\n\nYour Assignopedia ${role.toUpperCase()} password reset OTP is ${otp}.\n\nThis OTP expires in 10 minutes. If you did not request this, please ignore this email.`,
    html: `<p>Hello ${account.name},</p><p>Your Assignopedia <strong>${role.toUpperCase()}</strong> password reset OTP is <strong>${otp}</strong>.</p><p>This OTP expires in 10 minutes. If you did not request this, please ignore this email.</p>`,
  });

  res.status(201).json({
    resetId: request.id,
    message: mail.skipped
      ? "OTP generated. Configure SMTP in backend/.env to send it by email."
      : "OTP sent to your registered email.",
    mail,
  });
}));

router.post("/auth/reset-password", asyncRoute(async (req, res) => {
  required(req.body, ["resetId", "email", "role", "otp", "newPassword"]);
  const email = req.body.email.trim().toLowerCase();
  const role = req.body.role.trim().toLowerCase();
  let matchedRequest = null;
  const requests = await store.read("passwordResetRequests", defaults.passwordResetRequests);
  const nextRequests = requests.map((request) => {
    if (
      request.id === req.body.resetId &&
      request.email === email &&
      request.role === role &&
      request.otp === req.body.otp
    ) {
      matchedRequest = request;
      return { ...request, status: "Used", usedAt: nowIso() };
    }

    return request;
  });

  if (!matchedRequest) {
    throw createError(400, "Invalid OTP. Please check and try again.");
  }

  if (matchedRequest.status === "Used") {
    throw createError(400, "This OTP has already been used.");
  }

  if (new Date(matchedRequest.expiresAt).getTime() < Date.now()) {
    throw createError(400, "OTP expired. Please request a new one.");
  }

  let updatedAccount = null;
  const accounts = await store.update("accounts", defaults.accounts, (current) =>
    current.map((account) => {
      if (account.email !== email || account.role !== role) {
        return account;
      }

      updatedAccount = { ...account, password: req.body.newPassword, updatedAt: nowIso() };
      return updatedAccount;
    })
  );

  if (!updatedAccount) {
    throw createError(404, "Account not found.");
  }

  await store.write("passwordResetRequests", nextRequests);
  res.json({
    user: publicAccount(updatedAccount),
    accounts: accounts.map(publicAccount),
    message: "Password changed successfully. You can login now.",
  });
}));

router.get("/accounts", asyncRoute(async (req, res) => {
  const accounts = await store.read("accounts", defaults.accounts);
  res.json(accounts.map(publicAccount));
}));

router.patch("/accounts/password", asyncRoute(async (req, res) => {
  required(req.body, ["email", "password"]);
  const email = req.body.email.trim().toLowerCase();
  let updated = null;
  const accounts = await store.update("accounts", defaults.accounts, (current) =>
    current.map((account) => {
      if (account.email !== email) {
        return account;
      }

      updated = { ...account, password: req.body.password, updatedAt: nowIso() };
      return updated;
    })
  );

  if (!updated) {
    throw createError(404, "Account not found");
  }

  res.json({ user: publicAccount(updated), accounts: accounts.map(publicAccount) });
}));

router.get("/profiles", asyncRoute(async (req, res) => {
  res.json(await store.read("profiles", defaults.profiles));
}));

router.get("/profiles/:role/:email", asyncRoute(async (req, res) => {
  const profiles = await store.read("profiles", defaults.profiles);
  const key = `${req.params.role}:${req.params.email.toLowerCase()}`;
  res.json(profiles[key] || null);
}));

router.put("/profiles/:role/:email", asyncRoute(async (req, res) => {
  const key = `${req.params.role}:${req.params.email.toLowerCase()}`;
  const profiles = await store.update("profiles", defaults.profiles, (current) => ({
    ...current,
    [key]: { ...(current[key] || {}), ...req.body, updatedAt: nowIso() },
  }));

  res.json({ profile: profiles[key], profiles });
}));

router.get("/team", asyncRoute(async (req, res) => {
  res.json(await store.read("team", defaults.team));
}));

router.put("/team", asyncRoute(async (req, res) => {
  const nextTeam = {
    leader: { ...defaults.team.leader, ...(req.body.leader || {}), id: "leader" },
    members: Array.isArray(req.body.members) ? req.body.members : defaults.team.members,
    updatedAt: nowIso(),
  };

  await store.write("team", nextTeam);
  res.json(nextTeam);
}));

router.put("/team/leader", asyncRoute(async (req, res) => {
  const team = await store.update("team", defaults.team, (current) => ({
    ...current,
    leader: { ...current.leader, ...req.body, id: "leader" },
    updatedAt: nowIso(),
  }));

  res.json(team);
}));

router.post("/team/members", asyncRoute(async (req, res) => {
  const member = {
    id: req.body.id || makeId("member"),
    name: req.body.name || "New Team Member",
    role: req.body.role || "Team Member",
    imageDataUrl: req.body.imageDataUrl || "",
    imageName: req.body.imageName || "",
  };
  const team = await store.update("team", defaults.team, (current) => ({
    ...current,
    members: [...current.members, member],
    updatedAt: nowIso(),
  }));

  res.status(201).json({ member, team });
}));

router.put("/team/members/:id", asyncRoute(async (req, res) => {
  let updatedMember = null;
  const team = await store.update("team", defaults.team, (current) => ({
    ...current,
    members: current.members.map((member) => {
      if (member.id !== req.params.id) {
        return member;
      }

      updatedMember = { ...member, ...req.body, id: member.id };
      return updatedMember;
    }),
    updatedAt: nowIso(),
  }));

  if (!updatedMember) {
    throw createError(404, "Team member not found");
  }

  res.json({ member: updatedMember, team });
}));

router.delete("/team/members/:id", asyncRoute(async (req, res) => {
  const current = await store.read("team", defaults.team);
  const exists = current.members.some((member) => member.id === req.params.id);

  if (!exists) {
    throw createError(404, "Team member not found");
  }

  const team = await store.write("team", {
    ...current,
    members: current.members.filter((member) => member.id !== req.params.id),
    updatedAt: nowIso(),
  });

  res.json(team);
}));

collectionRoute({ path: "/blog-posts", storeName: "blogPosts", fallback: defaults.blogPosts, idPrefix: "blog", requiredFields: ["title"] });
collectionRoute({ path: "/departments", storeName: "departments", fallback: defaults.departments, idPrefix: "dept", requiredFields: ["name"] });
collectionRoute({ path: "/employees", storeName: "employees", fallback: defaults.employees, idPrefix: "employee", requiredFields: ["name"] });
collectionRoute({ path: "/admin-employees", storeName: "adminEmployees", fallback: defaults.adminEmployees, idPrefix: "admin-employee", requiredFields: ["name"] });
collectionRoute({ path: "/notices", storeName: "notices", fallback: defaults.notices, idPrefix: "notice", requiredFields: ["title"] });
collectionRoute({ path: "/attendance", storeName: "attendance", fallback: defaults.attendance, idPrefix: "attendance", requiredFields: ["email", "date"] });
collectionRoute({ path: "/leave-requests", storeName: "leaveRequests", fallback: defaults.leaveRequests, idPrefix: "leave", requiredFields: ["name", "type"] });
collectionRoute({ path: "/wfh-requests", storeName: "wfhRequests", fallback: defaults.wfhRequests, idPrefix: "wfh", requiredFields: ["name", "date"] });
collectionRoute({ path: "/cv-applications", storeName: "cvApplications", fallback: defaults.cvApplications, idPrefix: "cv", requiredFields: ["fullName", "email"] });
collectionRoute({ path: "/password-reset-requests", storeName: "passwordResetRequests", fallback: defaults.passwordResetRequests, idPrefix: "password-reset", requiredFields: ["email"] });
collectionRoute({ path: "/tasks", storeName: "tasks", fallback: defaults.tasks, idPrefix: "task", requiredFields: ["title"] });
collectionRoute({ path: "/revenue", storeName: "revenue", fallback: defaults.revenue, idPrefix: "revenue" });
collectionRoute({ path: "/reports", storeName: "reports", fallback: defaults.reports, idPrefix: "report" });
collectionRoute({ path: "/system-events", storeName: "systemEvents", fallback: defaults.systemEvents, idPrefix: "system" });

router.patch("/leave-requests/:id/decision", asyncRoute(async (req, res) => {
  required(req.body, ["status"]);
  const decisionDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  let request = null;
  const requests = await store.update("leaveRequests", defaults.leaveRequests, (current) =>
    current.map((item) => {
      if (item.id !== req.params.id) {
        return item;
      }

      request = { ...item, status: req.body.status, decisionDate, updatedAt: nowIso() };
      return request;
    })
  );

  if (!request) {
    throw createError(404, "Leave request not found");
  }

  if (request.email) {
    await store.update("employeeNotifications", defaults.employeeNotifications, (current) => [
      {
        id: makeId("notification"),
        type: "Leave",
        employeeEmail: request.email,
        status: request.status,
        detail: `${request.type} for ${request.dates || request.date || ""}`,
        date: decisionDate,
        message: `Your Leave request was ${request.status.toLowerCase()} by HR on ${decisionDate}.`,
      },
      ...current,
    ]);
  }

  res.json({ request, requests });
}));

router.patch("/wfh-requests/:id/decision", asyncRoute(async (req, res) => {
  required(req.body, ["status"]);
  const decisionDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  let request = null;
  const requests = await store.update("wfhRequests", defaults.wfhRequests, (current) =>
    current.map((item) => {
      if (item.id !== req.params.id) {
        return item;
      }

      request = { ...item, status: req.body.status, decisionDate, updatedAt: nowIso() };
      return request;
    })
  );

  if (!request) {
    throw createError(404, "WFH request not found");
  }

  if (request.email) {
    await store.update("employeeNotifications", defaults.employeeNotifications, (current) => [
      {
        id: makeId("notification"),
        type: "WFH",
        employeeEmail: request.email,
        status: request.status,
        detail: `${request.task || "WFH"} on ${request.date || ""}`,
        date: decisionDate,
        message: `Your WFH request was ${request.status.toLowerCase()} by HR on ${decisionDate}.`,
      },
      ...current,
    ]);
  }

  res.json({ request, requests });
}));

router.get("/notifications/hr", asyncRoute(async (req, res) => {
  res.json(await store.read("hrNotifications", defaults.hrNotifications));
}));

router.get("/notifications/employee", asyncRoute(async (req, res) => {
  res.json(await store.read("employeeNotifications", defaults.employeeNotifications));
}));

router.get("/notifications/employee/:email", asyncRoute(async (req, res) => {
  const notifications = await store.read("employeeNotifications", defaults.employeeNotifications);
  res.json(notifications.filter((item) => item.employeeEmail === req.params.email));
}));

router.post("/contact-submissions", asyncRoute(async (req, res) => {
  required(req.body, ["name", "email", "message"]);
  const submission = {
    id: makeId("contact"),
    ...req.body,
    status: "New",
    createdAt: nowIso(),
  };
  const submissions = await store.update("contactSubmissions", defaults.contactSubmissions, (current) => [
    submission,
    ...current,
  ]);
  const mail = await sendMail({
    to: process.env.CONTACT_TO || "assignopedia2.0@gmail.com",
    subject: `New Assignopedia contact query from ${submission.name}`,
    text: `Name: ${submission.name}\nEmail: ${submission.email}\n\n${submission.message}`,
  });

  res.status(201).json({ submission, submissions, mail });
}));

router.get("/contact-submissions", asyncRoute(async (req, res) => {
  res.json(await store.read("contactSubmissions", defaults.contactSubmissions));
}));

router.post("/career-submissions", asyncRoute(async (req, res) => {
  required(req.body, ["fullName", "email", "phone", "position"]);
  const application = {
    id: makeId("cv"),
    ...req.body,
    status: req.body.status || "New",
    submittedAt: nowIso(),
    date: new Date().toLocaleDateString(),
  };
  const applications = await store.update("cvApplications", defaults.cvApplications, (current) => [
    application,
    ...current,
  ]);
  const mail = await sendMail({
    to: process.env.CAREERS_TO || "hrrecruiter.aop@gmail.com",
    subject: `New career application: ${application.position}`,
    text: `Name: ${application.fullName}\nEmail: ${application.email}\nPhone: ${application.phone}\nPosition: ${application.position}\n\n${application.about || ""}`,
  });

  res.status(201).json({ application, applications, mail });
}));

router.get("/settings", asyncRoute(async (req, res) => {
  res.json(await store.read("settings", defaults.settings));
}));

router.put("/settings", asyncRoute(async (req, res) => {
  const settings = await store.write("settings", { ...req.body, updatedAt: nowIso() });
  res.json(settings);
}));

module.exports = router;
