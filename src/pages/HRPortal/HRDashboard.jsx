import {
  FaBell,
  FaBuilding,
  FaCalendarCheck,
  FaChartPie,
  FaClipboardList,
  FaFileAlt,
  FaIdBadge,
  FaLaptopHouse,
  FaRegCalendarAlt,
  FaUsers,
  FaUserTie,
} from "react-icons/fa";
import HRPortalLayout from "./HRPortalLayout";

const summaryCards = [
  { label: "Total Employees", value: "126", note: "Active workforce", icon: <FaUsers /> },
  { label: "Leave Requests", value: "18", note: "7 pending", icon: <FaCalendarCheck /> },
  { label: "WFH Requests", value: "09", note: "4 awaiting review", icon: <FaLaptopHouse /> },
  { label: "Attendance Today", value: "92%", note: "116 present", icon: <FaClipboardList /> },
  { label: "Notices", value: "05", note: "This week", icon: <FaBell /> },
];

const leaveTypes = [
  { label: "Annual Leave", value: 42, color: "#2563eb" },
  { label: "Personal Leave", value: 24, color: "#60a5fa" },
  { label: "Medical Leave", value: 21, color: "#f4a300" },
  { label: "Other Leave", value: 13, color: "#94a3b8" },
];

const notices = [
  "Updated holiday calendar is available for review.",
  "June payroll inputs close on Friday at 5 PM.",
  "WFH approval SLA revised to one working day.",
  "Quarterly engagement survey opens next week.",
];

const attendance = [
  { label: "Present", value: "116" },
  { label: "Absent", value: "05" },
  { label: "On Leave", value: "04" },
  { label: "Half Day", value: "01" },
];

const quickActions = [
  { label: "CV Access", icon: <FaFileAlt /> },
  { label: "Employee ID", icon: <FaIdBadge /> },
  { label: "Organization Structure", icon: <FaBuilding /> },
  { label: "WFH Approval", icon: <FaLaptopHouse /> },
  { label: "Leave Approval", icon: <FaCalendarCheck /> },
  { label: "Attendance Checking", icon: <FaClipboardList /> },
  { label: "Notice Board", icon: <FaBell /> },
];

function HRDashboard({ activePage, onNavigate }) {
  return (
    <HRPortalLayout
      activePage={activePage}
      eyebrow="People Operations"
      title="HR Dashboard"
      onNavigate={onNavigate}
    >
      <section className="hr-summary-grid" aria-label="HR summary">
        {summaryCards.map((card) => (
          <article className="hr-summary-card" key={card.label}>
            <div>{card.icon}</div>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.note}</small>
          </article>
        ))}
      </section>

      <section className="hr-main-grid">
        <article className="hr-panel leave-overview-card">
          <div className="hr-panel-heading">
            <div>
              <span>Leave Requests</span>
              <h2>Leave Requests Overview</h2>
            </div>
            <FaChartPie />
          </div>
          <div className="leave-overview-content">
            <div className="leave-donut" aria-label="Leave requests donut chart">
              <span>100</span>
              <small>Total</small>
            </div>
            <div className="leave-legend">
              {leaveTypes.map((item) => (
                <div key={item.label}>
                  <i style={{ background: item.color }} />
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="hr-panel notices-card">
          <div className="hr-panel-heading">
            <div>
              <span>Notice Board</span>
              <h2>Notices</h2>
            </div>
            <FaBell />
          </div>
          <div className="hr-notice-list">
            {notices.map((notice) => (
              <p key={notice}>{notice}</p>
            ))}
          </div>
        </article>

        <article className="hr-panel attendance-card">
          <div className="hr-panel-heading">
            <div>
              <span>Today</span>
              <h2>Today's Attendance</h2>
            </div>
            <FaRegCalendarAlt />
          </div>
          <div className="attendance-content">
            <div className="attendance-ring">
              <strong>92%</strong>
              <small>Present</small>
            </div>
            <div className="attendance-stats">
              {attendance.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="hr-panel quick-actions-card">
          <div className="hr-panel-heading">
            <div>
              <span>Shortcuts</span>
              <h2>Quick Actions</h2>
            </div>
            <FaUserTie />
          </div>
          <div className="hr-quick-grid">
            {quickActions.map((action) => (
              <button type="button" key={action.label}>
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </article>
      </section>
    </HRPortalLayout>
  );
}

export default HRDashboard;
