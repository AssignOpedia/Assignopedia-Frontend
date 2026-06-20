import { getCurrentUser } from "./authStorage";
import { getAttendanceRecords, getEmployeeAttendanceForToday, isLateLogin } from "./attendanceStorage";

const leaveRequestKey = "hrLeaveRequests";
const wfhRequestKey = "employeeWfhRequests";
const annualLeaveAllowance = 12;
const monthlyTargetMinutes = 160 * 60;

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parseTimeToMinutes = (time) => {
  const match = String(time).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  const [, hourText, minuteText, periodText] = match;
  const period = periodText.toUpperCase();
  let hour = Number(hourText);

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return hour * 60 + Number(minuteText);
};

const readStoredItems = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const getCurrentEmployeeRecords = () => {
  const currentUser = getCurrentUser();

  return getAttendanceRecords().filter((record) => record.email === currentUser.email);
};

const getCurrentEmployeeLeaveRequests = () => {
  const currentUser = getCurrentUser();

  return readStoredItems(leaveRequestKey).filter(
    (request) => request.email === currentUser.email || request.name === currentUser.name
  );
};

export const getCurrentEmployeeWfhRequests = () => {
  const currentUser = getCurrentUser();

  return readStoredItems(wfhRequestKey).filter(
    (request) => request.email === currentUser.email || request.name === currentUser.name
  );
};

export const saveEmployeeWfhRequest = (request) => {
  const savedRequests = readStoredItems(wfhRequestKey);

  localStorage.setItem(wfhRequestKey, JSON.stringify([request, ...savedRequests]));
  window.dispatchEvent(new CustomEvent("employee-wfh-request-updated"));
};

const getLeaveDaysUsed = (requests) =>
  requests
    .filter((request) => request.status === "Approved")
    .reduce((total, request) => total + Number(request.days || 0), 0);

const getWorkMinutes = (record) => {
  const login = parseTimeToMinutes(record.loginTime);
  const logout = parseTimeToMinutes(record.logoutTime);

  if (login === null || logout === null) {
    return 0;
  }

  return Math.max(logout - login, 0);
};

const getMonthKey = (year, monthIndex) => `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

const getScoreLabel = (score) => {
  if (score >= 90) {
    return "Excellent";
  }

  if (score >= 75) {
    return "Good";
  }

  if (score >= 60) {
    return "Needs Focus";
  }

  return "Low";
};

export const getEmployeeDashboardMetrics = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthKey = getMonthKey(currentYear, today.getMonth());
  const todayRecord = getEmployeeAttendanceForToday();
  const attendanceRecords = getCurrentEmployeeRecords();
  const currentMonthRecords = attendanceRecords.filter((record) => record.date?.startsWith(currentMonthKey));
  const leaveRequests = getCurrentEmployeeLeaveRequests();
  const wfhRequests = getCurrentEmployeeWfhRequests();
  const lateLoginCount = currentMonthRecords.filter((record) => {
    return isLateLogin(record.loginTime);
  }).length;
  const leaveDaysUsed = getLeaveDaysUsed(leaveRequests);
  const monthlyWorkMinutes = currentMonthRecords.reduce(
    (total, record) => total + getWorkMinutes(record),
    0
  );
  const workProgressBars = monthNames.map((month, monthIndex) => {
    const monthKey = getMonthKey(currentYear, monthIndex);
    const monthRecords = attendanceRecords.filter((record) => record.date?.startsWith(monthKey));
    const workMinutes = monthRecords.reduce((total, record) => total + getWorkMinutes(record), 0);
    const hours = Math.floor(workMinutes / 60);

    return {
      month,
      value: Math.min(Math.round((workMinutes / monthlyTargetMinutes) * 100), 100),
      completed: `${hours}h completed`,
      hours,
    };
  });
  const totalWorkHours = workProgressBars.reduce((total, item) => total + item.hours, 0);
  const presentDays = currentMonthRecords.filter((record) => record.loginTime).length;
  const onTimeDays = currentMonthRecords.filter((record) => {
    return record.loginTime && !isLateLogin(record.loginTime);
  }).length;
  const punctualityScore = presentDays ? Math.round((onTimeDays / presentDays) * 100) : 0;
  const attendanceScore = Math.min(presentDays * 4, 100);
  const workScore = Math.min(Math.round((monthlyWorkMinutes / monthlyTargetMinutes) * 100), 100);
  const score = Math.round((punctualityScore * 0.35) + (attendanceScore * 0.3) + (workScore * 0.35));

  return {
    cards: {
      todayLogin: todayRecord.loginTime || "Not recorded",
      logoutAttendance: todayRecord.logoutTime || "Not recorded",
      lateLogin: `${String(lateLoginCount).padStart(2, "0")} Days`,
      leaveBalance: `${Math.max(annualLeaveAllowance - leaveDaysUsed, 0)} Days`,
      wfhDays: `${String(wfhRequests.length).padStart(2, "0")} Days`,
    },
    notes: {
      todayLogin: todayRecord.loginTime ? "Today" : "Click Login",
      logoutAttendance: todayRecord.logoutTime ? "Today" : "Click Logout",
      lateLogin: "This month",
      leaveBalance: "Available",
      wfhDays: "Requested",
    },
    workProgressBars,
    totalWorkHours,
    workReport: {
      presentDays,
      lateLoginCount,
      leaveDaysUsed,
      wfhDays: wfhRequests.length,
      monthlyWorkHours: Math.floor(monthlyWorkMinutes / 60),
      monthlyTargetHours: monthlyTargetMinutes / 60,
    },
    performance: {
      score,
      label: getScoreLabel(score),
      punctualityScore,
      attendanceScore,
      workScore,
      collaborationScore: Math.max(70, Math.min(100, 100 - leaveDaysUsed * 3 + wfhRequests.length)),
    },
  };
};
