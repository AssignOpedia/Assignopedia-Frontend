import { useEffect, useState } from "react";
import { FaCalendarAlt, FaClock, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import {
  attendanceEvent,
  formatCurrentTime,
  getAttendanceRecords,
  getEmployeeAttendanceForToday,
  getEmployeeMonthlyAttendanceSummary,
  getEmployeeMonthlyAttendanceTrend,
  loadAttendanceRecords,
  upsertTodayAttendance,
} from "../../utils/attendanceStorage";
import { currentUserEvent } from "../../utils/authStorage";
import { syncAttendanceRemote } from "../../utils/hrPortalApi";
import EmployeePortalLayout from "./EmployeePortalLayout";

function EmployeeAttendance({ activePage, onNavigate }) {
  const [attendanceRecord, setAttendanceRecord] = useState(getEmployeeAttendanceForToday);
  const [attendanceSummary, setAttendanceSummary] = useState(getEmployeeMonthlyAttendanceSummary);
  const [attendanceTrend, setAttendanceTrend] = useState(getEmployeeMonthlyAttendanceTrend);
  const [statusMessage, setStatusMessage] = useState("");
  const today = new Date();
  const currentDay = today.getDate();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const monthLabel = today.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const attendanceByDay = new Map(attendanceTrend.map((item) => [item.day, item]));
  const calendarDays = [
    ...Array.from({ length: firstWeekday }, (_, index) => ({ type: "blank", id: `blank-${index}` })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const record = attendanceByDay.get(day);
      const isFuture = day > currentDay;
      const hasLogin = Boolean(record?.loginTime);
      const status = isFuture ? "upcoming" : hasLogin ? "present" : "absent";

      return {
        type: "day",
        day,
        record,
        status,
        label: isFuture ? "Upcoming" : hasLogin ? "Present" : "Absent",
      };
    }),
  ];
  const absentDays = attendanceTrend.filter((item) => !item.loginTime).length;
  const stats = [
    { label: "Present Days", value: attendanceSummary.presentDays, note: "This month", icon: <FaCalendarAlt /> },
    { label: "Average Login", value: attendanceSummary.averageLogin, note: "Based on logins", icon: <FaSignInAlt /> },
    { label: "Average Logout", value: attendanceSummary.averageLogout, note: "Based on logouts", icon: <FaSignOutAlt /> },
    { label: "Work Hours", value: attendanceSummary.workHours, note: "Monthly total", icon: <FaClock /> },
  ];

  const refreshAttendanceState = () => {
    setAttendanceRecord(getEmployeeAttendanceForToday());
    setAttendanceSummary(getEmployeeMonthlyAttendanceSummary());
    setAttendanceTrend(getEmployeeMonthlyAttendanceTrend());
  };

  useEffect(() => {
    const handleAttendanceUpdate = () => {
      refreshAttendanceState();
    };

    window.addEventListener(attendanceEvent, handleAttendanceUpdate);
    window.addEventListener(currentUserEvent, handleAttendanceUpdate);
    loadAttendanceRecords().then(handleAttendanceUpdate).catch(() => {});

    return () => {
      window.removeEventListener(attendanceEvent, handleAttendanceUpdate);
      window.removeEventListener(currentUserEvent, handleAttendanceUpdate);
    };
  }, []);

  const showMessage = (message) => {
    setStatusMessage(message);
  };

  const handleLoginClick = () => {
    const record = upsertTodayAttendance({ loginTime: formatCurrentTime() });

    refreshAttendanceState();
    setAttendanceRecord(record);
    syncAttendanceRemote(getAttendanceRecords()).catch(() => {});
    showMessage("Login recorded successfully. HR and Admin can now see it.");
  };

  const handleLogoutClick = () => {
    const record = upsertTodayAttendance({ logoutTime: formatCurrentTime() });

    refreshAttendanceState();
    setAttendanceRecord(record);
    syncAttendanceRemote(getAttendanceRecords()).catch(() => {});
    showMessage("Logout recorded successfully. Attendance report updated.");
  };

  return (
    <EmployeePortalLayout
      activePage={activePage}
      eyebrow="Attendance"
      title="Attendance Overview"
      onNavigate={onNavigate}
    >
      <section className="leave-action-panel attendance-action-panel">
        <div>
          <span>Daily Attendance</span>
          <h2>Record today&apos;s login and logout</h2>
          <p>Click login or logout to instantly save the latest time for today.</p>
        </div>
        <div className="leave-action-buttons">
          <button type="button" onClick={handleLoginClick}>
            Login
          </button>
          <button type="button" onClick={handleLogoutClick}>
            Logout
          </button>
        </div>
      </section>

      {statusMessage && (
        <div className="request-success" role="status">
          {statusMessage}
        </div>
      )}

      <section className="portal-insight-grid">
        {stats.map((item) => (
          <article className="attendance-card" key={item.label}>
            <div className="card-icon">{item.icon}</div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.note}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="portal-card chart-card">
          <div className="card-heading">
            <div>
              <span>Monthly Log</span>
              <h3>Attendance Calendar</h3>
            </div>
          </div>
          <div className="attendance-calendar-panel">
            <div className="attendance-calendar-summary">
              <div>
                <strong>{monthLabel}</strong>
                <span>{attendanceSummary.presentDays} present days - {absentDays} absent days</span>
              </div>
              <div className="attendance-calendar-legend" aria-label="Attendance calendar legend">
                <span><i className="present" /> Present</span>
                <span><i className="absent" /> Absent</span>
                <span><i className="upcoming" /> Upcoming</span>
              </div>
            </div>

            <div className="attendance-calendar-weekdays" aria-hidden="true">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="attendance-calendar-grid">
              {calendarDays.map((item) =>
                item.type === "blank" ? (
                  <span className="attendance-calendar-empty" key={item.id} />
                ) : (
                  <div
                    className={`attendance-calendar-day ${item.status}`}
                    key={item.day}
                    title={`${item.day} ${monthLabel} | ${item.label} | Login: ${item.record?.loginTime || "-"} | Logout: ${item.record?.logoutTime || "-"} | Work: ${item.record?.workHours || "0h 0m"}`}
                  >
                    <strong>{item.day}</strong>
                    <span>{item.label}</span>
                    {item.record?.loginTime && <small>{item.record.loginTime}</small>}
                  </div>
                )
              )}
            </div>
          </div>
        </article>

        <article className="portal-card">
          <div className="card-heading">
            <div>
              <span>Today</span>
              <h3>Live Attendance</h3>
            </div>
          </div>
          <div className="timeline-list">
            <p><strong>Login</strong><span>{attendanceRecord.loginTime || "Not recorded"}</span></p>
            <p><strong>Logout</strong><span>{attendanceRecord.logoutTime || "Not recorded"}</span></p>
          </div>
        </article>
      </section>

    </EmployeePortalLayout>
  );
}

export default EmployeeAttendance;
