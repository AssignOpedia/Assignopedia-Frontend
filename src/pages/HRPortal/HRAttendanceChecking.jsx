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

function HRAttendanceChecking({ activePage, onNavigate }) {
  const [rows, setRows] = useState(() =>
    getAttendanceRecords().filter((record) => record.date === getTodayKey())
  );
  const searchQuery = useHrSearchQuery();
  const filteredRows = rows.filter((row) => itemMatchesSearch(row, searchQuery));

  useEffect(() => {
    const refreshRows = () => {
      setRows(getAttendanceRecords().filter((record) => record.date === getTodayKey()));
    };

    getAttendanceRemote()
      .then((remoteRecords) => {
        setAttendanceRecords(remoteRecords);
        setRows(remoteRecords.filter((record) => record.date === getTodayKey()));
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
        <div className="hr-panel-heading"><div><span>Today</span><h2>Employee Attendance</h2></div><FaClipboardList /></div>
        <div className="hr-table-wrap">
          <table className="hr-table">
            <thead><tr><th>Employee</th><th>Email</th><th>Login</th><th>Logout</th><th>Status</th></tr></thead>
            <tbody>
              {filteredRows.length > 0 ? filteredRows.map((row) => {
                const status = getAttendanceStatusFromLogin(row.loginTime);

                return (
                  <tr key={`${row.email}-${row.date}`}>
                    <td>{row.employeeName}</td><td>{row.email}</td><td>{row.loginTime || "-"}</td><td>{row.logoutTime || "-"}</td>
                    <td><span className={`hr-status ${status.toLowerCase().replace(" ", "-")}`}>{status}</span></td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5">
                    {rows.length === 0
                      ? "No employee attendance has been recorded today."
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
