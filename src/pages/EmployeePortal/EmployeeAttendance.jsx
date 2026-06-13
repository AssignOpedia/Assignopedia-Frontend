import { useState } from "react";
import { FaCalendarAlt, FaClock, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import EmployeePortalLayout from "./EmployeePortalLayout";

const stats = [
  { label: "Present Days", value: "22", note: "This month", icon: <FaCalendarAlt /> },
  { label: "Average Login", value: "09:21 AM", note: "On schedule", icon: <FaSignInAlt /> },
  { label: "Average Logout", value: "06:38 PM", note: "Healthy hours", icon: <FaSignOutAlt /> },
  { label: "Work Hours", value: "176h", note: "Monthly total", icon: <FaClock /> },
];

const storageKey = "employeeAttendanceRecord";

const getTodayKey = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatCurrentTime = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const getStoredAttendance = () => {
  const storedRecord = localStorage.getItem(storageKey);

  if (!storedRecord) {
    return { date: getTodayKey(), loginTime: "", logoutTime: "" };
  }

  try {
    const parsedRecord = JSON.parse(storedRecord);

    if (parsedRecord.date === getTodayKey()) {
      return {
        date: parsedRecord.date,
        loginTime: parsedRecord.loginTime || "",
        logoutTime: parsedRecord.logoutTime || "",
      };
    }
  } catch {
    localStorage.removeItem(storageKey);
  }

  return { date: getTodayKey(), loginTime: "", logoutTime: "" };
};

function EmployeeAttendance({ activePage, onNavigate }) {
  const [attendanceRecord, setAttendanceRecord] = useState(getStoredAttendance);
  const [statusMessage, setStatusMessage] = useState("");

  const showMessage = (message) => {
    setStatusMessage(message);
  };

  const saveAttendanceRecord = (record) => {
    localStorage.setItem(storageKey, JSON.stringify(record));
    setAttendanceRecord(record);
  };

  const handleLoginClick = () => {
    const record = {
      date: getTodayKey(),
      loginTime: formatCurrentTime(),
      logoutTime: attendanceRecord.logoutTime,
    };

    saveAttendanceRecord(record);
    showMessage("Login recorded successfully.");
  };

  const handleLogoutClick = () => {
    saveAttendanceRecord({
      ...attendanceRecord,
      logoutTime: formatCurrentTime(),
    });
    showMessage("Logout recorded successfully.");
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
              <h3>Attendance Trend</h3>
            </div>
          </div>
          <div className="attendance-chart">
            {[82, 90, 86, 92, 78, 88, 95, 84, 91, 87, 93, 89].map((value, index) => (
              <div className="chart-column" key={value + index}>
                <span style={{ height: `${value}%` }} />
                <small>{index + 1}</small>
              </div>
            ))}
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
