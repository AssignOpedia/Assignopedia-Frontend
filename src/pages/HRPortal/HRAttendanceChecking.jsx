import { useEffect, useState } from "react";
import { FaClipboardList } from "react-icons/fa";
import {
  attendanceEvent,
  getAttendanceRecords,
  getAttendanceStatusFromLogin,
  getTodayKey,
  setAttendanceRecords,
} from "../../utils/attendanceStorage";
import { getAttendanceRemote } from "../../utils/hrPortalApi";
import { itemMatchesSearch, useHrSearchQuery } from "../../utils/hrSearch";
import HRPortalLayout from "./HRPortalLayout";

const sortAttendanceRecords = (records) =>
  [...records].sort((a, b) => {
    const dateCompare = String(b.date || "").localeCompare(String(a.date || ""));

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return String(a.employeeName || "").localeCompare(String(b.employeeName || ""));
  });

const formatAttendanceDate = (date) => {
  if (!date) {
    return "-";
  }

  const [year, month, day] = String(date).split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}-${month}-${year}`;
};

function HRAttendanceChecking({ activePage, onNavigate }) {
  const [rows, setRows] = useState(() => sortAttendanceRecords(getAttendanceRecords()));
  const searchQuery = useHrSearchQuery();
  const filteredRows = rows.filter((row) => itemMatchesSearch(row, searchQuery));
  const todayKey = getTodayKey();
  const todayLabel = formatAttendanceDate(todayKey);

  useEffect(() => {
    const refreshRows = () => {
      setRows(sortAttendanceRecords(getAttendanceRecords()));
    };

    getAttendanceRemote()
      .then((remoteRecords) => {
        setAttendanceRecords(remoteRecords);
        setRows(sortAttendanceRecords(remoteRecords));
      })
      .catch(() => {});

    window.addEventListener(attendanceEvent, refreshRows);
    window.addEventListener("storage", refreshRows);
    return () => {
      window.removeEventListener(attendanceEvent, refreshRows);
      window.removeEventListener("storage", refreshRows);
    };
  }, []);

  return (
    <HRPortalLayout activePage={activePage} eyebrow="Attendance" title="Attendance Checking" onNavigate={onNavigate}>
      <article className="hr-panel">
        <div className="hr-panel-heading"><div><span>Today: {todayLabel}</span><h2>Employee Attendance Records</h2></div><FaClipboardList /></div>
        <div className="hr-table-wrap">
          <table className="hr-table">
            <thead><tr><th>Date</th><th>Employee</th><th>Email</th><th>Login</th><th>Logout</th><th>Status</th></tr></thead>
            <tbody>
              {filteredRows.length > 0 ? filteredRows.map((row) => {
                const status = getAttendanceStatusFromLogin(row.loginTime);
                const isToday = row.date === todayKey;

                return (
                  <tr key={`${row.email}-${row.date}`}>
                    <td>{formatAttendanceDate(row.date)}{isToday ? " (Today)" : ""}</td><td>{row.employeeName}</td><td>{row.email}</td><td>{row.loginTime || "-"}</td><td>{row.logoutTime || "-"}</td>
                    <td><span className={`hr-status ${status.toLowerCase().replace(" ", "-")}`}>{status}</span></td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6">
                    {rows.length === 0
                      ? "No employee attendance has been recorded yet."
                      : "No attendance records match the current search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </HRPortalLayout>
  );
}

export default HRAttendanceChecking;
