import { getCurrentUser } from "./authStorage";
import { createApiResourceStore } from "./apiResourceStore";

const attendanceEvent = "assignopedia-attendance-updated";
const lateLoginCutoffMinutes = 11 * 60 + 15;
const attendanceStore = createApiResourceStore({
  resource: "attendance",
  event: attendanceEvent,
  fallback: [],
});

export const getTodayKey = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatCurrentTime = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const readAttendanceRecords = () => {
  return attendanceStore.get();
};

const saveAttendanceRecords = (records) => attendanceStore.save(records);

export const getAttendanceRecords = () => readAttendanceRecords();

export const loadAttendanceRecords = () => attendanceStore.load();

export const setAttendanceRecords = (records) => {
  saveAttendanceRecords(Array.isArray(records) ? records : []).catch(() => {});
};

const parseTimeToMinutes = (time) => {
  const match = String(time).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

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

const formatMinutesAsTime = (minutes) => {
  if (!Number.isFinite(minutes)) {
    return "--";
  }

  const roundedMinutes = Math.round(minutes);
  const hour24 = Math.floor(roundedMinutes / 60) % 24;
  const minute = roundedMinutes % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;

  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
};

export const isLateLogin = (loginTime) => {
  const login = parseTimeToMinutes(loginTime);

  return login !== null && login > lateLoginCutoffMinutes;
};

export const getAttendanceStatusFromLogin = (loginTime) => {
  if (!loginTime) {
    return "Absent";
  }

  return isLateLogin(loginTime) ? "Late" : "Present";
};

export const getEmployeeMonthlyAttendanceSummary = () => {
  const currentUser = getCurrentUser();
  const today = new Date();
  const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const monthlyRecords = readAttendanceRecords().filter(
    (record) => record.email === currentUser.email && record.date?.startsWith(monthKey)
  );
  const presentRecords = monthlyRecords.filter((record) => record.loginTime);
  const loginMinutes = presentRecords
    .map((record) => parseTimeToMinutes(record.loginTime))
    .filter((value) => value !== null);
  const logoutMinutes = monthlyRecords
    .map((record) => parseTimeToMinutes(record.logoutTime))
    .filter((value) => value !== null);
  const workMinutes = monthlyRecords.reduce((total, record) => {
    const login = parseTimeToMinutes(record.loginTime);
    const logout = parseTimeToMinutes(record.logoutTime);

    if (login === null || logout === null) {
      return total;
    }

    return total + Math.max(logout - login, 0);
  }, 0);
  const average = (values) =>
    values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;

  return {
    presentDays: presentRecords.length,
    averageLogin: formatMinutesAsTime(average(loginMinutes)),
    averageLogout: formatMinutesAsTime(average(logoutMinutes)),
    workHours: `${Math.floor(workMinutes / 60)}h ${workMinutes % 60}m`,
  };
};

export const getEmployeeMonthlyAttendanceTrend = () => {
  const currentUser = getCurrentUser();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const daysElapsed = today.getDate();
  const monthlyRecords = readAttendanceRecords().filter(
    (record) => record.email === currentUser.email && record.date?.startsWith(monthKey)
  );
  const recordsByDate = new Map(
    monthlyRecords.map((record) => [record.date, record])
  );

  return Array.from({ length: daysElapsed }, (_, index) => {
    const day = index + 1;
    const date = `${monthKey}-${String(day).padStart(2, "0")}`;
    const record = recordsByDate.get(date);
    const login = parseTimeToMinutes(record?.loginTime);
    const logout = parseTimeToMinutes(record?.logoutTime);
    const workMinutes = login !== null && logout !== null ? Math.max(logout - login, 0) : 0;
    const completion = workMinutes > 0 ? Math.min(Math.round((workMinutes / 480) * 100), 100) : 0;

    return {
      date,
      day,
      loginTime: record?.loginTime || "",
      logoutTime: record?.logoutTime || "",
      workHours: `${Math.floor(workMinutes / 60)}h ${workMinutes % 60}m`,
      value: record?.loginTime ? Math.max(completion, record.logoutTime ? 12 : 35) : 6,
      status: record?.loginTime ? (record.logoutTime ? "Completed" : "Logged in") : "No record",
    };
  });
};

export const getEmployeeAttendanceForToday = () => {
  const currentUser = getCurrentUser();
  const today = getTodayKey();
  const record = readAttendanceRecords().find(
    (item) => item.email === currentUser.email && item.date === today
  );

  if (record) {
    return record;
  }

  return {
    date: today,
    employeeName: currentUser.name,
    email: currentUser.email,
    loginTime: "",
    logoutTime: "",
    status: "Absent",
  };
};

export const upsertTodayAttendance = ({ loginTime, logoutTime }) => {
  const currentUser = getCurrentUser();
  const today = getTodayKey();
  const records = readAttendanceRecords().map((record) => ({ ...record }));
  const recordIndex = records.findIndex(
    (item) => item.email === currentUser.email && item.date === today
  );
  const existingRecord = recordIndex >= 0 ? records[recordIndex] : {};
  const nextRecord = {
    ...existingRecord,
    id: existingRecord.id || `attendance-${currentUser.email}-${today}`,
    date: today,
    employeeName: currentUser.name,
    email: currentUser.email,
    loginTime: loginTime ?? existingRecord.loginTime ?? "",
    logoutTime: logoutTime ?? existingRecord.logoutTime ?? "",
    status: getAttendanceStatusFromLogin(loginTime ?? existingRecord.loginTime ?? ""),
  };

  if (recordIndex >= 0) {
    records[recordIndex] = nextRecord;
  } else {
    records.unshift(nextRecord);
  }

  saveAttendanceRecords(records).catch(() => {});

  return nextRecord;
};

const buildEmptyTodayAttendance = (currentUser, today) => ({
  date: today,
  employeeName: currentUser.name,
  email: currentUser.email,
  loginTime: "",
  logoutTime: "",
  status: "Absent",
});

export const toggleTodayAttendanceField = async (field) => {
  const currentUser = getCurrentUser();
  const today = getTodayKey();
  const records = readAttendanceRecords().map((record) => ({ ...record }));
  const recordIndex = records.findIndex(
    (item) => item.email === currentUser.email && item.date === today
  );
  const existingRecord = recordIndex >= 0 ? records[recordIndex] : null;
  const hasExistingValue = Boolean(existingRecord?.[field]);
  const nextRecord = {
    ...(existingRecord || {}),
    id: existingRecord?.id || `attendance-${currentUser.email}-${today}`,
    date: today,
    employeeName: currentUser.name,
    email: currentUser.email,
    loginTime: existingRecord?.loginTime || "",
    logoutTime: existingRecord?.logoutTime || "",
  };

  if (hasExistingValue) {
    nextRecord[field] = "";
  } else {
    nextRecord[field] = formatCurrentTime();
  }

  nextRecord.status = getAttendanceStatusFromLogin(nextRecord.loginTime);

  const shouldDeleteRecord =
    (hasExistingValue && field === "loginTime") || (!nextRecord.loginTime && !nextRecord.logoutTime);

  if (shouldDeleteRecord) {
    if (recordIndex >= 0) {
      records.splice(recordIndex, 1);
    }
  } else if (recordIndex >= 0) {
    records[recordIndex] = nextRecord;
  } else {
    records.unshift(nextRecord);
  }

  await saveAttendanceRecords(records);

  return {
    action: hasExistingValue ? "removed" : "recorded",
    deleted: shouldDeleteRecord,
    field,
    record: shouldDeleteRecord ? buildEmptyTodayAttendance(currentUser, today) : nextRecord,
  };
};

export const buildAttendanceCsv = (records = readAttendanceRecords()) => {
  const headers = ["Date", "Employee", "Email", "Login", "Logout", "Status"];
  const rows = records.map((record) => [
    record.date,
    record.employeeName,
    record.email,
    record.loginTime || "-",
    record.logoutTime || "-",
    record.status,
  ]);
  const escapeCell = (cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`;

  return [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");
};

export const downloadAttendanceCsv = () => {
  const records = readAttendanceRecords();
  const csv = buildAttendanceCsv(records);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `attendance-report-${getTodayKey()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export { attendanceEvent };
