const express = require("express");
const store = require("../lib/mongoStore");
const {
  deleteReplacedProfileImages,
  findUploadByFileName,
  isDataUrl,
  normalizeMediaPayload,
  uploadDataUrl,
} = require("../lib/cloudinaryStore");
const { asyncRoute, createError, makeId, nowIso, required } = require("../lib/http");
const { sendMail } = require("../lib/mailer");
const defaults = require("../data/defaults");
const {
  loadAccounts,
  rejectDuplicateEmail,
  requireMatchingAccount,
  validateLogin,
  validateRegister,
} = require("../middleware/authMiddleware");

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
  projects: { storeName: "projects", fallback: defaults.projects },
  revenue: { storeName: "revenue", fallback: defaults.revenue },
  reports: { storeName: "reports", fallback: defaults.reports },
  settings: { storeName: "settings", fallback: defaults.settings },
  systemEvents: { storeName: "systemEvents", fallback: defaults.systemEvents },
  tasks: { storeName: "tasks", fallback: defaults.tasks },
  taskSubmissions: { storeName: "taskSubmissions", fallback: defaults.taskSubmissions },
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

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const attendanceLateCutoffMinutes = Number(process.env.ATTENDANCE_LATE_CUTOFF_MINUTES || 11 * 60 + 15);
const attendanceAutoLogoutMinutes = Number(process.env.ATTENDANCE_AUTO_LOGOUT_MINUTES || 21 * 60);
const attendanceMaintenanceIntervalMs = Number(process.env.ATTENDANCE_MAINTENANCE_INTERVAL_MS || 5 * 60 * 1000);
const attendanceTimeZone = process.env.ATTENDANCE_TIME_ZONE || "Asia/Kolkata";

const getTimeZoneParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: attendanceTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type)?.value || "";

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: Number(value("hour") || 0) % 24,
    minute: Number(value("minute") || 0),
  };
};

const formatDateKey = (date = new Date()) => {
  const { year, month, day } = getTimeZoneParts(date);

  return `${year}-${month}-${day}`;
};

const parseTimeToMinutes = (time) => {
  const match = String(time || "").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  const [, hourText, minuteText, periodText] = match;
  const period = periodText.toUpperCase();
  let hour = Number(hourText);
  const minute = Number(minuteText);

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
};

const isLateAttendanceTime = (time) => {
  const minutes = parseTimeToMinutes(time);

  return minutes !== null && minutes > attendanceLateCutoffMinutes;
};

const getAttendanceStatus = (loginTime) => {
  if (!loginTime) {
    return "Absent";
  }

  return isLateAttendanceTime(loginTime) ? "Late" : "Present";
};

const getAutoLogoutIso = (dateKey) => new Date(`${dateKey}T21:00:00+05:30`).toISOString();

const closeStaleAttendanceSessions = (records, now = new Date()) => {
  const today = formatDateKey(now);
  const { hour, minute } = getTimeZoneParts(now);
  const currentMinutes = hour * 60 + minute;
  let changed = false;

  const closedRecords = (Array.isArray(records) ? records : []).map((record) => {
    if (!record?.date || !record.loginTime || record.logoutTime) {
      return record;
    }

    const isPreviousDay = String(record.date) < today;
    const isTodayPastCutoff = String(record.date) === today && currentMinutes >= attendanceAutoLogoutMinutes;

    if (!isPreviousDay && !isTodayPastCutoff) {
      return record;
    }

    changed = true;

    return {
      ...record,
      logoutTime: "09:00 PM",
      logoutDateTime: record.logoutDateTime || getAutoLogoutIso(record.date),
      autoLogout: true,
      autoLogoutReason: "Attendance auto-closed at 9:00 PM",
      status: record.status || getAttendanceStatus(record.loginTime),
      updatedAt: now.toISOString(),
    };
  });

  return { records: closedRecords, changed };
};

const readAttendanceRecords = async () => {
  const records = await store.read("attendance", defaults.attendance);
  const closed = closeStaleAttendanceSessions(records);

  if (closed.changed) {
    await store.write("attendance", closed.records);
  }

  return closed.records;
};

const writeAttendanceRecords = async (records) => {
  const closed = closeStaleAttendanceSessions(records);

  return store.write("attendance", closed.records);
};

const runAttendanceMaintenance = async () => {
  try {
    await readAttendanceRecords();
  } catch (error) {
    console.warn(`Attendance maintenance failed. ${error.message}`);
  }
};

if (attendanceMaintenanceIntervalMs > 0) {
  setInterval(runAttendanceMaintenance, attendanceMaintenanceIntervalMs);
  runAttendanceMaintenance();
}

const makeEmployeeId = (account) => {
  const idSource = String(account.id || account.email || Date.now())
    .replace(/^account-/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();

  return `EMP-${idSource || Date.now()}`;
};

const employeeFromAccount = (account, existing = {}) => ({
  id: existing.id || makeEmployeeId(account),
  name: existing.name || account.name || "Employee",
  department: existing.department || existing.team || "General",
  jobCode: existing.jobCode || existing.role || "Employee",
  email: normalizeEmail(existing.email || account.email),
  role: existing.role || existing.jobCode || "Employee",
  team: existing.team || existing.department || "General",
  status: existing.status || "Present",
  score: Number(existing.score || 0),
  createdAt: existing.createdAt || new Date().toLocaleDateString(),
  updatedAt: nowIso(),
});

const syncEmployeeAccount = async (account) => {
  if (!account || account.role !== "employee") {
    return null;
  }

  let syncedEmployee = null;
  const accountEmail = normalizeEmail(account.email);

  await store.update("employees", defaults.employees, (current) => {
    const existingIndex = current.findIndex((employee) => normalizeEmail(employee.email) === accountEmail);

    if (existingIndex < 0) {
      syncedEmployee = employeeFromAccount(account);
      return [syncedEmployee, ...current];
    }

    return current.map((employee, index) => {
      if (index !== existingIndex) {
        return employee;
      }

      syncedEmployee = employeeFromAccount(account, employee);
      return syncedEmployee;
    });
  });

  return syncedEmployee;
};

const syncRegisteredEmployeeAccounts = async () => {
  const accounts = await store.read("accounts", defaults.accounts);
  const employeeAccounts = (Array.isArray(accounts) ? accounts : []).filter(
    (account) => normalizeEmail(account.role) === "employee"
  );

  if (employeeAccounts.length === 0) {
    return store.read("employees", defaults.employees);
  }

  return store.update("employees", defaults.employees, (current) => {
    const employeesByEmail = new Map(
      (Array.isArray(current) ? current : []).map((employee) => [normalizeEmail(employee.email), employee])
    );

    employeeAccounts.forEach((account) => {
      const email = normalizeEmail(account.email);

      if (!email) {
        return;
      }

      employeesByEmail.set(email, employeeFromAccount(account, employeesByEmail.get(email) || {}));
    });

    return Array.from(employeesByEmail.values()).sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  });
};

router.get("/sync/:resource", asyncRoute(async (req, res) => {
  const target = syncStores[req.params.resource];

  if (!target) {
    throw createError(404, "Sync resource not found");
  }

  if (target.storeName === "attendance") {
    res.json(await readAttendanceRecords());
    return;
  }

  if (target.storeName === "projects") {
    res.json(await completeProjectsFromSubmissions());
    return;
  }

  if (target.storeName === "employees") {
    await syncRegisteredEmployeeAccounts();
    res.json(await updateAllEmployeePerformanceFromSubmissions());
    return;
  }

  res.json(await store.read(target.storeName, target.fallback));
}));

router.put("/sync/:resource", asyncRoute(async (req, res) => {
  const target = syncStores[req.params.resource];

  if (!target) {
    throw createError(404, "Sync resource not found");
  }

  const body = await normalizeMediaPayload(req.body, `assignopedia/${target.storeName}`);
  if (target.storeName === "profiles") {
    const previousProfiles = await store.read("profiles", defaults.profiles);
    const data = await store.write("profiles", body);

    await deleteReplacedProfileImages(previousProfiles, data);
    res.json(data);
    return;
  }

  const data = target.storeName === "attendance" ? await writeAttendanceRecords(body) : await store.write(target.storeName, body);
  res.json(data);
}));

router.post("/uploads", asyncRoute(async (req, res) => {
  required(req.body, ["dataUrl"]);
  const upload = await uploadDataUrl(req.body.dataUrl, {
    folder: req.body.folder || "assignopedia/uploads",
    fileName: req.body.fileName || "",
    resourceType: req.body.resourceType || "auto",
  });

  res.status(201).json({ upload });
}));

const collectionRoute = ({ path, storeName, fallback, idPrefix, requiredFields = [] }) => {
  router.get(path, asyncRoute(async (req, res) => {
    if (storeName === "attendance") {
      res.json(await readAttendanceRecords());
      return;
    }

    if (storeName === "projects") {
      res.json(await completeProjectsFromSubmissions());
      return;
    }

    if (storeName === "employees") {
      await syncRegisteredEmployeeAccounts();
      res.json(await updateAllEmployeePerformanceFromSubmissions());
      return;
    }

    res.json(await store.read(storeName, fallback));
  }));

  router.get(`${path}/:id`, asyncRoute(async (req, res) => {
    const items = storeName === "attendance"
      ? await readAttendanceRecords()
      : storeName === "projects"
        ? await completeProjectsFromSubmissions()
        : storeName === "employees"
          ? (await syncRegisteredEmployeeAccounts(), await updateAllEmployeePerformanceFromSubmissions())
        : await store.read(storeName, fallback);
    const item = items.find((currentItem) => currentItem.id === req.params.id);

    if (!item) {
      throw createError(404, "Item not found");
    }

    res.json(item);
  }));

  router.post(path, asyncRoute(async (req, res) => {
    const body = await normalizeMediaPayload(req.body, `assignopedia/${storeName}`);
    required(body, requiredFields);
    const item = {
      id: body.id || makeId(idPrefix),
      ...body,
      createdAt: body.createdAt || nowIso(),
      updatedAt: nowIso(),
    };
    let created = true;
    const items = await store.update(storeName, fallback, (current) => {
      const existingIndex = current.findIndex((currentItem) => currentItem.id === item.id);

      if (existingIndex < 0) {
        return [item, ...current];
      }

      created = false;
      return current.map((currentItem, index) =>
        index === existingIndex
          ? { ...currentItem, ...item, createdAt: currentItem.createdAt || item.createdAt }
          : currentItem
      );
    });
    const responseItems = storeName === "attendance" ? await writeAttendanceRecords(items) : items;

    res.status(created ? 201 : 200).json({ item, items: responseItems });
  }));

  router.put(`${path}/:id`, asyncRoute(async (req, res) => {
    const body = await normalizeMediaPayload(req.body, `assignopedia/${storeName}`);
    let updatedItem = null;
    const items = await store.update(storeName, fallback, (current) =>
      current.map((item) => {
        if (item.id !== req.params.id) {
          return item;
        }

        updatedItem = { ...item, ...body, id: item.id, updatedAt: nowIso() };
        return updatedItem;
      })
    );
    const responseItems = storeName === "attendance" ? await writeAttendanceRecords(items) : items;

    if (!updatedItem) {
      throw createError(404, "Item not found");
    }

    res.json({ item: updatedItem, items: responseItems });
  }));

  router.delete(`${path}/:id`, asyncRoute(async (req, res) => {
    const current = storeName === "attendance" ? await readAttendanceRecords() : await store.read(storeName, fallback);
    const exists = current.some((item) => item.id === req.params.id);

    if (!exists) {
      throw createError(404, "Item not found");
    }

    const nextItems = current.filter((item) => item.id !== req.params.id);
    const items = storeName === "attendance" ? await writeAttendanceRecords(nextItems) : await store.write(storeName, nextItems);
    res.json({ id: req.params.id, items });
  }));
};

const getStoredFile = (item) => {
  const remoteUrl = item.fileUrl || item.pdfUrl || "";
  const dataUrl = item.fileData || item.pdfData || "";
  const fileName = item.fileName || item.pdfFileName || "document";
  const fileType = item.fileType || "";

  if (remoteUrl || (dataUrl && !isDataUrl(dataUrl))) {
    return {
      url: remoteUrl || dataUrl,
      fileName,
      fileType: fileType || "application/octet-stream",
    };
  }

  const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/s);

  if (!match) {
    return null;
  }

  return {
    buffer: Buffer.from(match[2], "base64"),
    fileName,
    fileType: fileType || match[1] || "application/octet-stream",
  };
};

const getStoredCvFile = (item) => {
  const remoteUrl = item.cvUrl || item.cvData || "";
  const inlineData = item.cvInlineData || (isDataUrl(item.cvData) ? item.cvData : "");
  const fileName = item.cvFileName || "candidate-cv.pdf";
  const fileType = item.cvFileType || item.fileType || "application/pdf";

  if (inlineData) {
    const match = String(inlineData).match(/^data:([^;]+);base64,(.+)$/s);

    if (match) {
      return {
        buffer: Buffer.from(match[2], "base64"),
        fileName,
        fileType: fileType || match[1] || "application/pdf",
      };
    }
  }

  if (remoteUrl && !isDataUrl(remoteUrl)) {
    return {
      url: remoteUrl,
      fileName,
      fileType,
    };
  }

  return null;
};

const safeFileName = (fileName) =>
  String(fileName || "document").replace(/[\r\n"]/g, "").replace(/[\\/]/g, "-");

const getProjectTitle = (project = {}) => project.title || project.name || "Untitled Project";

const getProjectDeadlineDateTime = (project = {}) => {
  if (project.deadlineDateTime) {
    return project.deadlineDateTime;
  }

  if (project.deadlineDate && project.deadlineTime) {
    return new Date(`${project.deadlineDate}T${project.deadlineTime}:00+05:30`).toISOString();
  }

  return "";
};

const findProjectForSubmission = async (submission) => {
  const projects = await store.read("projects", defaults.projects);
  const projectId = String(submission.projectId || "");
  const projectTitle = String(submission.projectTitle || "");

  return (Array.isArray(projects) ? projects : []).find((project) =>
    String(project.id || "") === projectId ||
    String(getProjectTitle(project)) === projectTitle
  ) || null;
};

const getSubmissionPerformanceStatus = (submission, project) => {
  const deadlineDateTime = getProjectDeadlineDateTime(project);

  if (!deadlineDateTime) {
    return {
      deadlineDate: project?.deadlineDate || "",
      deadlineTime: project?.deadlineTime || "",
      deadlineDateTime: "",
      submittedOnTime: true,
      submissionTimingStatus: "On Time",
    };
  }

  const submittedAt = new Date(submission.submittedAt || submission.createdAt || nowIso()).getTime();
  const deadlineAt = new Date(deadlineDateTime).getTime();
  const submittedOnTime = Number.isNaN(deadlineAt) || submittedAt <= deadlineAt;

  return {
    deadlineDate: project?.deadlineDate || "",
    deadlineTime: project?.deadlineTime || "",
    deadlineDateTime,
    submittedOnTime,
    submissionTimingStatus: submittedOnTime ? "On Time" : "Late",
  };
};

const completeProjectFromSubmission = async (submission) => {
  let completedProject = null;
  const projectId = String(submission.projectId || "");
  const projectTitle = String(submission.projectTitle || "");
  const completedAt = submission.submittedAt || nowIso();
  const projects = await store.update("projects", defaults.projects, (current) =>
    current.map((project) => {
      const matchesProject =
        String(project.id || "") === projectId ||
        String(getProjectTitle(project)) === projectTitle;

      if (!matchesProject) {
        return project;
      }

      completedProject = {
        ...project,
        status: "Completed",
        progress: 100,
        completedAt,
        deliveredAt: completedAt,
        lastSubmissionId: submission.id,
        lastSubmittedBy: submission.employeeEmail,
        updatedAt: nowIso(),
      };

      return completedProject;
    })
  );

  return { completedProject, projects };
};

const getSubmissionTime = (submission = {}) => {
  const date = new Date(submission.submittedAt || submission.createdAt || 0);

  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const completeProjectsFromSubmissions = async () => {
  const [projects, submissions] = await Promise.all([
    store.read("projects", defaults.projects),
    store.read("taskSubmissions", defaults.taskSubmissions),
  ]);

  if (!Array.isArray(submissions) || submissions.length === 0) {
    return projects;
  }

  let changed = false;
  const completedProjects = (Array.isArray(projects) ? projects : []).map((project) => {
    const projectId = String(project.id || getProjectTitle(project));
    const projectTitle = String(getProjectTitle(project));
    const matchingSubmissions = submissions
      .filter((submission) =>
        String(submission.projectId || "") === projectId ||
        String(submission.projectTitle || "") === projectTitle
      )
      .sort((a, b) => getSubmissionTime(b) - getSubmissionTime(a));

    if (matchingSubmissions.length === 0) {
      return project;
    }

    const latestSubmission = matchingSubmissions[0];
    const completedAt = latestSubmission.submittedAt || latestSubmission.createdAt || nowIso();
    const alreadyCompleted =
      project.status === "Completed" &&
      Number(project.progress || 0) === 100 &&
      project.deliveredAt &&
      project.lastSubmissionId === latestSubmission.id;

    if (alreadyCompleted) {
      return project;
    }

    changed = true;

    return {
      ...project,
      status: "Completed",
      progress: 100,
      completedAt: project.completedAt || completedAt,
      deliveredAt: project.deliveredAt || completedAt,
      lastSubmissionId: latestSubmission.id,
      lastSubmittedBy: latestSubmission.employeeEmail,
      updatedAt: nowIso(),
    };
  });

  if (changed) {
    await store.write("projects", completedProjects);
  }

  return completedProjects;
};

const calculateTaskPerformance = (submissions) => {
  const completedSubmissions = (Array.isArray(submissions) ? submissions : []).filter(
    (submission) => submission.status === "Completed" || submission.status === "Submitted"
  );
  const completedCount = completedSubmissions.length;
  const onTimeCount = completedSubmissions.filter((submission) => submission.submittedOnTime !== false).length;
  const lateCount = Math.max(completedCount - onTimeCount, 0);
  const completionScore = completedCount > 0 ? 100 : 0;
  const onTimeScore = completedCount > 0 ? Math.round((onTimeCount / completedCount) * 100) : 0;
  const score = completedCount > 0 ? Math.round((completionScore * 0.45) + (onTimeScore * 0.55)) : 0;

  return {
    score,
    completionScore,
    onTimeScore,
    completedCount,
    onTimeCount,
    lateCount,
  };
};

const updateEmployeePerformanceFromSubmissions = async (employeeEmail, fallbackName = "Employee") => {
  const email = normalizeEmail(employeeEmail);

  if (!email) {
    return null;
  }

  const submissions = await store.read("taskSubmissions", defaults.taskSubmissions);
  const employeeSubmissions = (Array.isArray(submissions) ? submissions : []).filter(
    (submission) => normalizeEmail(submission.employeeEmail) === email
  );
  const performance = calculateTaskPerformance(employeeSubmissions);
  let updatedEmployee = null;

  await store.update("employees", defaults.employees, (current) => {
    const existingIndex = current.findIndex((employee) => normalizeEmail(employee.email) === email);
    const performanceUpdates = {
      score: performance.score,
      taskCompletionScore: performance.completionScore,
      taskOnTimeScore: performance.onTimeScore,
      taskCompletedCount: performance.completedCount,
      onTimeTaskCount: performance.onTimeCount,
      lateTaskCount: performance.lateCount,
      performance: {
        taskCompletion: performance.completionScore,
        deadlineReliability: performance.onTimeScore,
        completedTasks: performance.completedCount,
        onTimeTasks: performance.onTimeCount,
        lateTasks: performance.lateCount,
        updatedAt: nowIso(),
      },
      updatedAt: nowIso(),
    };

    if (existingIndex < 0) {
      updatedEmployee = {
        id: `EMP-${email.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toUpperCase()}`,
        name: fallbackName,
        email,
        department: "Delivery",
        jobCode: "Employee",
        role: "Employee",
        team: "Delivery",
        status: "Present",
        createdAt: new Date().toLocaleDateString(),
        ...performanceUpdates,
      };

      return [updatedEmployee, ...current];
    }

    return current.map((employee, index) => {
      if (index !== existingIndex) {
        return employee;
      }

      updatedEmployee = {
        ...employee,
        name: employee.name || fallbackName,
        ...performanceUpdates,
      };
      return updatedEmployee;
    });
  });

  return updatedEmployee;
};

const updateAllEmployeePerformanceFromSubmissions = async () => {
  const submissions = await store.read("taskSubmissions", defaults.taskSubmissions);
  const submissionsByEmail = new Map();

  (Array.isArray(submissions) ? submissions : []).forEach((submission) => {
    const email = normalizeEmail(submission.employeeEmail);

    if (!email) {
      return;
    }

    submissionsByEmail.set(email, [...(submissionsByEmail.get(email) || []), submission]);
  });

  if (submissionsByEmail.size === 0) {
    return store.read("employees", defaults.employees);
  }

  return store.update("employees", defaults.employees, (current) => {
    const employeesByEmail = new Map(current.map((employee) => [normalizeEmail(employee.email), employee]));

    submissionsByEmail.forEach((employeeSubmissions, email) => {
      const performance = calculateTaskPerformance(employeeSubmissions);
      const latestSubmission = [...employeeSubmissions].sort((a, b) => getSubmissionTime(b) - getSubmissionTime(a))[0] || {};
      const employee = employeesByEmail.get(email) || {
        id: `EMP-${email.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toUpperCase()}`,
        name: latestSubmission.employeeName || "Employee",
        email,
        department: "Delivery",
        jobCode: "Employee",
        role: "Employee",
        team: "Delivery",
        status: "Present",
        createdAt: new Date().toLocaleDateString(),
      };

      employeesByEmail.set(email, {
        ...employee,
        score: performance.score,
        taskCompletionScore: performance.completionScore,
        taskOnTimeScore: performance.onTimeScore,
        taskCompletedCount: performance.completedCount,
        onTimeTaskCount: performance.onTimeCount,
        lateTaskCount: performance.lateCount,
        performance: {
          ...(employee.performance || {}),
          taskCompletion: performance.completionScore,
          deadlineReliability: performance.onTimeScore,
          completedTasks: performance.completedCount,
          onTimeTasks: performance.onTimeCount,
          lateTasks: performance.lateCount,
          updatedAt: nowIso(),
        },
        updatedAt: nowIso(),
      });
    });

    const knownEmails = new Set();
    const merged = [];

    current.forEach((employee) => {
      const email = normalizeEmail(employee.email);
      const updatedEmployee = employeesByEmail.get(email) || employee;
      knownEmails.add(email);
      merged.push(updatedEmployee);
    });

    employeesByEmail.forEach((employee, email) => {
      if (!knownEmails.has(email)) {
        merged.unshift(employee);
      }
    });

    return merged;
  });
};

router.post("/auth/register", validateRegister, loadAccounts, rejectDuplicateEmail, asyncRoute(async (req, res) => {
  const { email, name, password, role } = req.authBody;
  const account = {
    id: makeId("account"),
    name,
    email,
    password,
    role,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  await store.write("accounts", [...req.accounts, account]);
  const employee = await syncEmployeeAccount(account);
  res.status(201).json({ user: publicAccount(account), employee });
}));

router.post("/auth/login", validateLogin, loadAccounts, requireMatchingAccount, asyncRoute(async (req, res) => {
  const employee = await syncEmployeeAccount(req.account);
  await readAttendanceRecords();
  res.json({ user: publicAccount(req.account), employee });
}));

router.post("/auth/logout", loadAccounts, asyncRoute(async (req, res) => {
  required(req.body, ["email", "role"]);
  await readAttendanceRecords();

  res.json({ ok: true });
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
  const role = String(req.body.role || "").trim().toLowerCase();
  const existingAccounts = await store.read("accounts", defaults.accounts);
  const matchingAccounts = existingAccounts.filter((account) => account.email === email);

  if (!role && matchingAccounts.length > 1) {
    throw createError(400, "Role is required when this email is registered in multiple portals.");
  }

  let updated = null;
  const accounts = await store.update("accounts", defaults.accounts, (current) =>
    current.map((account) => {
      if (account.email !== email || (role && account.role !== role)) {
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
  const body = await normalizeMediaPayload(req.body, "assignopedia/profiles");
  const previousProfiles = await store.read("profiles", defaults.profiles);
  const profiles = await store.update("profiles", defaults.profiles, (current) => ({
    ...current,
    [key]: { ...(current[key] || {}), ...body, updatedAt: nowIso() },
  }));

  await deleteReplacedProfileImages(previousProfiles, profiles);
  res.json({ profile: profiles[key], profiles });
}));

router.get("/team", asyncRoute(async (req, res) => {
  res.json(await store.read("team", defaults.team));
}));

router.put("/team", asyncRoute(async (req, res) => {
  const body = await normalizeMediaPayload(req.body, "assignopedia/team");
  const nextTeam = {
    leader: { ...defaults.team.leader, ...(body.leader || {}), id: "leader" },
    members: Array.isArray(body.members) ? body.members : defaults.team.members,
    updatedAt: nowIso(),
  };

  await store.write("team", nextTeam);
  res.json(nextTeam);
}));

router.put("/team/leader", asyncRoute(async (req, res) => {
  const body = await normalizeMediaPayload(req.body, "assignopedia/team/images");
  const team = await store.update("team", defaults.team, (current) => ({
    ...current,
    leader: { ...current.leader, ...body, id: "leader" },
    updatedAt: nowIso(),
  }));

  res.json(team);
}));

router.post("/team/members", asyncRoute(async (req, res) => {
  const body = await normalizeMediaPayload(req.body, "assignopedia/team/images");
  const member = {
    id: body.id || makeId("member"),
    name: body.name || "New Team Member",
    role: body.role || "Team Member",
    imageDataUrl: body.imageDataUrl || "",
    imageName: body.imageName || "",
    ...body,
  };
  const team = await store.update("team", defaults.team, (current) => ({
    ...current,
    members: [...current.members, member],
    updatedAt: nowIso(),
  }));

  res.status(201).json({ member, team });
}));

router.put("/team/members/:id", asyncRoute(async (req, res) => {
  const body = await normalizeMediaPayload(req.body, "assignopedia/team/images");
  let updatedMember = null;
  const team = await store.update("team", defaults.team, (current) => ({
    ...current,
    members: current.members.map((member) => {
      if (member.id !== req.params.id) {
        return member;
      }

      updatedMember = { ...member, ...body, id: member.id };
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
collectionRoute({ path: "/projects", storeName: "projects", fallback: defaults.projects, idPrefix: "project", requiredFields: ["name"] });
router.get("/leave-requests/:id/document", asyncRoute(async (req, res) => {
  const requests = await store.read("leaveRequests", defaults.leaveRequests);
  const request = requests.find((item) => item.id === req.params.id);

  if (!request) {
    throw createError(404, "Leave request not found");
  }

  const storedFile = getStoredFile(request);

  if (!storedFile) {
    throw createError(404, "No stored file data found for this leave request");
  }

  const disposition = req.query.download === "true" ? "attachment" : "inline";
  const fileName = safeFileName(storedFile.fileName);

  if (storedFile.url) {
    res.redirect(storedFile.url);
    return;
  }

  res.setHeader("Content-Type", storedFile.fileType);
  res.setHeader("Content-Length", storedFile.buffer.length);
  res.setHeader("Content-Disposition", `${disposition}; filename="${fileName}"`);
  res.send(storedFile.buffer);
}));

router.get("/wfh-requests/:id/document", asyncRoute(async (req, res) => {
  const requests = await store.read("wfhRequests", defaults.wfhRequests);
  const request = requests.find((item) => item.id === req.params.id);

  if (!request) {
    throw createError(404, "WFH request not found");
  }

  let storedFile = getStoredFile(request);

  if (!storedFile && request.fileName) {
    const upload = await findUploadByFileName(request.fileName, [
      "assignopedia/wfh-requests",
      "assignopedia/wfhRequests",
      "assignopedia/wfhRequests/documents",
      "assignopedia/uploads",
      "assignopedia",
    ]);

    if (upload?.url) {
      storedFile = {
        url: upload.url,
        fileName: request.fileName,
        fileType: request.fileType || "application/octet-stream",
      };

      await store.update("wfhRequests", defaults.wfhRequests, (current) =>
        current.map((item) =>
          item.id === req.params.id
            ? {
                ...item,
                fileUrl: upload.url,
                filePublicId: item.filePublicId || upload.publicId,
                fileResourceType: item.fileResourceType || upload.resourceType,
                fileSize: item.fileSize || upload.bytes,
                updatedAt: nowIso(),
              }
            : item
        )
      );
    }
  }

  if (!storedFile) {
    throw createError(404, "No stored file data found for this WFH request");
  }

  if (req.query.meta === "true") {
    res.json({
      url: storedFile.url || "",
      fileName: storedFile.fileName,
      fileType: storedFile.fileType,
    });
    return;
  }

  const disposition = req.query.download === "true" ? "attachment" : "inline";
  const fileName = safeFileName(storedFile.fileName);

  if (storedFile.url) {
    const fileResponse = await fetch(storedFile.url).catch(() => null);

    if (!fileResponse?.ok) {
      res.redirect(storedFile.url);
      return;
    }

    const buffer = Buffer.from(await fileResponse.arrayBuffer());

    res.setHeader("Content-Type", storedFile.fileType || fileResponse.headers.get("content-type") || "application/pdf");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Content-Disposition", `${disposition}; filename="${fileName}"`);
    res.send(buffer);
    return;
  }

  res.setHeader("Content-Type", storedFile.fileType);
  res.setHeader("Content-Length", storedFile.buffer.length);
  res.setHeader("Content-Disposition", `${disposition}; filename="${fileName}"`);
  res.send(storedFile.buffer);
}));

collectionRoute({ path: "/notices", storeName: "notices", fallback: defaults.notices, idPrefix: "notice", requiredFields: ["title"] });
collectionRoute({ path: "/attendance", storeName: "attendance", fallback: defaults.attendance, idPrefix: "attendance", requiredFields: ["email", "date"] });
collectionRoute({ path: "/leave-requests", storeName: "leaveRequests", fallback: defaults.leaveRequests, idPrefix: "leave", requiredFields: ["name", "type"] });
collectionRoute({ path: "/wfh-requests", storeName: "wfhRequests", fallback: defaults.wfhRequests, idPrefix: "wfh", requiredFields: ["name", "date"] });
router.get("/cv-applications/:id/document", asyncRoute(async (req, res) => {
  const applications = await store.read("cvApplications", defaults.cvApplications);
  const application = applications.find((item) => item.id === req.params.id);

  if (!application) {
    throw createError(404, "CV application not found");
  }

  const storedFile = getStoredCvFile(application);

  if (!storedFile) {
    throw createError(404, "No CV file data found for this application");
  }

  const disposition = req.query.download === "true" ? "attachment" : "inline";
  const fileName = safeFileName(storedFile.fileName);

  if (storedFile.url) {
    const fileResponse = await fetch(storedFile.url);

    if (!fileResponse.ok) {
      throw createError(502, "Could not load the CV file from Cloudinary");
    }

    const buffer = Buffer.from(await fileResponse.arrayBuffer());

    res.setHeader("Content-Type", storedFile.fileType || fileResponse.headers.get("content-type") || "application/pdf");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Content-Disposition", `${disposition}; filename="${fileName}"`);
    res.send(buffer);
    return;
  }

  res.setHeader("Content-Type", storedFile.fileType);
  res.setHeader("Content-Length", storedFile.buffer.length);
  res.setHeader("Content-Disposition", `${disposition}; filename="${fileName}"`);
  res.send(storedFile.buffer);
}));
collectionRoute({ path: "/cv-applications", storeName: "cvApplications", fallback: defaults.cvApplications, idPrefix: "cv", requiredFields: ["fullName", "email"] });
collectionRoute({ path: "/password-reset-requests", storeName: "passwordResetRequests", fallback: defaults.passwordResetRequests, idPrefix: "password-reset", requiredFields: ["email"] });
collectionRoute({ path: "/tasks", storeName: "tasks", fallback: defaults.tasks, idPrefix: "task", requiredFields: ["title"] });
router.post("/task-submissions", asyncRoute(async (req, res) => {
  const body = await normalizeMediaPayload(req.body, "assignopedia/taskSubmissions");
  required(body, ["projectId", "employeeEmail"]);

  const submittedAt = body.submittedAt || nowIso();
  const matchingProject = await findProjectForSubmission(body);
  const timing = getSubmissionPerformanceStatus({ ...body, submittedAt }, matchingProject);
  const submission = {
    id: body.id || makeId("task-submission"),
    ...body,
    employeeEmail: normalizeEmail(body.employeeEmail),
    status: "Completed",
    ...timing,
    submittedAt,
    createdAt: body.createdAt || submittedAt,
    updatedAt: nowIso(),
  };
  let created = true;
  const items = await store.update("taskSubmissions", defaults.taskSubmissions, (current) => {
    const existingIndex = current.findIndex((item) => item.id === submission.id);

    if (existingIndex < 0) {
      return [submission, ...current];
    }

    created = false;
    return current.map((item, index) =>
      index === existingIndex
        ? { ...item, ...submission, createdAt: item.createdAt || submission.createdAt }
        : item
    );
  });
  const { completedProject, projects } = await completeProjectFromSubmission(submission);
  const employee = await updateEmployeePerformanceFromSubmissions(submission.employeeEmail, submission.employeeName);

  res.status(created ? 201 : 200).json({
    item: submission,
    items,
    project: completedProject,
    projects,
    employee,
  });
}));
collectionRoute({ path: "/task-submissions", storeName: "taskSubmissions", fallback: defaults.taskSubmissions, idPrefix: "task-submission", requiredFields: ["projectId", "employeeEmail"] });
collectionRoute({ path: "/revenue", storeName: "revenue", fallback: defaults.revenue, idPrefix: "revenue" });
collectionRoute({ path: "/reports", storeName: "reports", fallback: defaults.reports, idPrefix: "report" });
collectionRoute({ path: "/system-events", storeName: "systemEvents", fallback: defaults.systemEvents, idPrefix: "system" });

router.patch("/leave-requests/:id/decision", asyncRoute(async (req, res) => {
  required(req.body, ["status"]);
  const approverRole = normalizeEmail(req.body.approverRole || "hr");
  const decidedBy = req.body.decidedBy || (approverRole === "admin" ? "Admin" : "HR");
  const decisionComment = req.body.decisionComment || "";
  const decisionDate = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  let request = null;
  const requests = await store.update("leaveRequests", defaults.leaveRequests, (current) =>
    current.map((item) => {
      if (item.id !== req.params.id) {
        return item;
      }

      if (normalizeEmail(item.requesterRole || "employee") === "hr" && approverRole !== "admin") {
        return item;
      }

      request = {
        ...item,
        status: req.body.status,
        approverRole,
        decidedBy,
        decisionComment,
        decisionDate,
        decisionDateTime: nowIso(),
        updatedAt: nowIso(),
      };
      return request;
    })
  );

  if (!request) {
    const existingRequests = await store.read("leaveRequests", defaults.leaveRequests);
    const existingRequest = existingRequests.find((item) => item.id === req.params.id);

    if (existingRequest && normalizeEmail(existingRequest.requesterRole || "employee") === "hr" && approverRole !== "admin") {
      throw createError(403, "Only Admin can approve or reject HR leave requests.");
    }

    throw createError(404, "Leave request not found");
  }

  if (request.email) {
    const notificationStore = normalizeEmail(request.requesterRole || "employee") === "hr"
      ? "hrNotifications"
      : "employeeNotifications";
    const notificationFallback = notificationStore === "hrNotifications"
      ? defaults.hrNotifications
      : defaults.employeeNotifications;

    await store.update(notificationStore, notificationFallback, (current) => [
      {
        id: makeId("notification"),
        type: "Leave",
        employeeEmail: request.email,
        hrEmail: request.email,
        status: request.status,
        detail: `${request.type} for ${request.dates || request.date || ""}`,
        date: decisionDate,
        message: `Your Leave request was ${request.status.toLowerCase()} by ${decidedBy} on ${decisionDate}.`,
      },
      ...current,
    ]);
  }

  res.json({ request, requests });
}));

router.patch("/wfh-requests/:id/decision", asyncRoute(async (req, res) => {
  required(req.body, ["status"]);
  const approverRole = normalizeEmail(req.body.approverRole || "hr");
  const decidedBy = req.body.decidedBy || (approverRole === "admin" ? "Admin" : "HR");
  const decisionComment = req.body.decisionComment || "";
  const decisionDate = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  let request = null;
  const requests = await store.update("wfhRequests", defaults.wfhRequests, (current) =>
    current.map((item) => {
      if (item.id !== req.params.id) {
        return item;
      }

      if (normalizeEmail(item.requesterRole || "employee") === "hr" && approverRole !== "admin") {
        return item;
      }

      request = {
        ...item,
        status: req.body.status,
        approverRole,
        decidedBy,
        decisionComment,
        decisionDate,
        decisionDateTime: nowIso(),
        updatedAt: nowIso(),
      };
      return request;
    })
  );

  if (!request) {
    const existingRequests = await store.read("wfhRequests", defaults.wfhRequests);
    const existingRequest = existingRequests.find((item) => item.id === req.params.id);

    if (existingRequest && normalizeEmail(existingRequest.requesterRole || "employee") === "hr" && approverRole !== "admin") {
      throw createError(403, "Only Admin can approve or reject HR WFH requests.");
    }

    throw createError(404, "WFH request not found");
  }

  if (request.email) {
    const notificationStore = normalizeEmail(request.requesterRole || "employee") === "hr"
      ? "hrNotifications"
      : "employeeNotifications";
    const notificationFallback = notificationStore === "hrNotifications"
      ? defaults.hrNotifications
      : defaults.employeeNotifications;

    await store.update(notificationStore, notificationFallback, (current) => [
      {
        id: makeId("notification"),
        type: "WFH",
        employeeEmail: request.email,
        hrEmail: request.email,
        status: request.status,
        detail: `${request.task || "WFH"} on ${request.date || ""}`,
        date: decisionDate,
        message: `Your WFH request was ${request.status.toLowerCase()} by ${decidedBy} on ${decisionDate}.`,
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
  const body = await normalizeMediaPayload(req.body, "assignopedia/cvApplications");
  required(body, ["fullName", "email", "phone", "position"]);
  const application = {
    id: makeId("cv"),
    ...body,
    status: body.status || "New",
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
