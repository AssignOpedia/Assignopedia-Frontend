import { useEffect, useState } from "react";
import {
  FaBell,
  FaBuilding,
  FaCalendarCheck,
  FaChartPie,
  FaClipboardList,
  FaFileAlt,
  FaIdBadge,
  FaLaptopHouse,
  FaLock,
  FaRegCalendarAlt,
  FaUsers,
  FaUserTie,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import HRPortalLayout from "./HRPortalLayout";
import { getPasswordResetRequests } from "../../utils/passwordResetRequests";
import { getSavedTotalEmployees, setTotalEmployees } from "../../utils/organizationStorage";
import { getNotices, getNoticeEvent } from "../../utils/noticeStorage";
import { attendanceEvent, getAttendanceRecords, getAttendanceStatusFromLogin, getTodayKey } from "../../utils/attendanceStorage";
import { getCVEvent, getStoredCVs } from "../../utils/cvStorage";
import { createApiResourceStore } from "../../utils/apiResourceStore";

const leaveStore = createApiResourceStore({
  resource: "leaveRequests",
  event: "hr-leave-request-updated",
  fallback: [],
});
const wfhStore = createApiResourceStore({
  resource: "wfhRequests",
  event: "employee-wfh-request-updated",
  fallback: [],
});

const getDashboardSnapshot = () => {
  const totalEmployees = getSavedTotalEmployees();
  const notices = getNotices();
  const todayAttendance = getAttendanceRecords().filter((record) => record.date === getTodayKey());
  const leaveRequests = leaveStore.get();
  const wfhRequests = wfhStore.get();
  const presentCount = todayAttendance.filter((record) => record.loginTime).length;
  const lateCount = todayAttendance.filter((record) => getAttendanceStatusFromLogin(record.loginTime) === "Late").length;
  const absentCount = Math.max(totalEmployees - presentCount, 0);
  const pendingLeaveCount = leaveRequests.filter((request) => (request.status || "Pending") === "Pending").length;
  const pendingWfhCount = wfhRequests.filter((request) => (request.status || "Pending") === "Pending").length;

  return {
    totalEmployees,
    notices,
    todayAttendance,
    leaveRequests,
    wfhRequests,
    cvApplications: getStoredCVs(),
    attendanceStats: [
      { label: "Present", value: String(presentCount).padStart(2, "0") },
      { label: "Absent", value: String(absentCount).padStart(2, "0") },
      { label: "Late", value: String(lateCount).padStart(2, "0") },
      { label: "Logged Records", value: String(todayAttendance.length).padStart(2, "0") },
    ],
    leaveBreakdown: [
      { label: "Pending", value: pendingLeaveCount, color: "#f4a300" },
      { label: "Approved", value: leaveRequests.filter((request) => request.status === "Approved").length, color: "#16a34a" },
      { label: "Rejected", value: leaveRequests.filter((request) => request.status === "Rejected").length, color: "#ef4444" },
      { label: "Total", value: leaveRequests.length, color: "#2563eb" },
    ],
    pendingLeaveCount,
    pendingWfhCount,
    attendancePercent: totalEmployees ? Math.round((presentCount / totalEmployees) * 100) : 0,
  };
};

const quickActions = [
  { label: "CV Access", icon: <FaFileAlt />, page: "hr-cv-access" },
  { label: "Employee ID", icon: <FaIdBadge />, page: "hr-employee-id" },
  { label: "Organization Structure", icon: <FaBuilding />, page: "hr-organization-structure" },
  { label: "WFH Approval", icon: <FaLaptopHouse />, page: "hr-wfh-approval" },
  { label: "Leave Approval", icon: <FaCalendarCheck />, page: "hr-leave-approval" },
  { label: "Attendance Checking", icon: <FaClipboardList />, page: "hr-attendance-checking" },
  { label: "Notice Board", icon: <FaBell />, page: "hr-notice-board" },
];

function HRDashboard({ activePage, onNavigate }) {
  const [dashboardData, setDashboardData] = useState(getDashboardSnapshot);
  const [editingEmployees, setEditingEmployees] = useState(false);
  const [editValue, setEditValue] = useState(String(getSavedTotalEmployees()));
  const passwordResetRequests = getPasswordResetRequests();
  const {
    attendancePercent,
    attendanceStats,
    cvApplications,
    leaveBreakdown,
    leaveRequests,
    notices,
    pendingLeaveCount,
    pendingWfhCount,
    todayAttendance,
    totalEmployees,
    wfhRequests,
  } = dashboardData;

  useEffect(() => {
    const handleUpdate = () => {
      setDashboardData(getDashboardSnapshot());
    };

    window.addEventListener("assignopedia-employee-count-updated", handleUpdate);
    window.addEventListener("hr-leave-request-updated", handleUpdate);
    window.addEventListener("employee-wfh-request-updated", handleUpdate);
    window.addEventListener(attendanceEvent, handleUpdate);
    window.addEventListener(getCVEvent(), handleUpdate);
    window.addEventListener(getNoticeEvent(), handleUpdate);

    return () => {
      window.removeEventListener("assignopedia-employee-count-updated", handleUpdate);
      window.removeEventListener("hr-leave-request-updated", handleUpdate);
      window.removeEventListener("employee-wfh-request-updated", handleUpdate);
      window.removeEventListener(attendanceEvent, handleUpdate);
      window.removeEventListener(getCVEvent(), handleUpdate);
      window.removeEventListener(getNoticeEvent(), handleUpdate);
    };
  }, []);

  const handleEditEmployees = () => {
    setEditValue(String(totalEmployees));
    setEditingEmployees(true);
  };

  const handleSaveEmployees = () => {
    const newCount = parseInt(editValue, 10);
    if (!isNaN(newCount) && newCount > 0) {
      setTotalEmployees(newCount);
      setDashboardData(getDashboardSnapshot());
      setEditingEmployees(false);
    } else {
      alert("Please enter a valid number");
    }
  };

  const handleCancelEdit = () => {
    setEditingEmployees(false);
    setEditValue(String(totalEmployees));
  };

  const summaryCards = [
    {
      label: "Total Employees",
      value: String(totalEmployees),
      note: "Active workforce",
      icon: <FaUsers />,
      editable: true,
    },
    {
      label: "Leave Requests",
      value: String(leaveRequests.length),
      note: `${pendingLeaveCount} pending`,
      icon: <FaCalendarCheck />,
      page: "hr-leave-approval",
    },
    {
      label: "WFH Requests",
      value: String(wfhRequests.length),
      note: `${pendingWfhCount} awaiting review`,
      icon: <FaLaptopHouse />,
      page: "hr-wfh-approval",
    },
    {
      label: "Attendance Today",
      value: `${attendancePercent}%`,
      note: `${todayAttendance.length} present`,
      icon: <FaClipboardList />,
      page: "hr-attendance-checking",
    },
    {
      label: "Notices",
      value: String(notices.length),
      note: "Published notices",
      icon: <FaBell />,
      page: "hr-notice-board",
    },
    {
      label: "CV Applications",
      value: String(cvApplications.length),
      note: "Candidate files",
      icon: <FaFileAlt />,
      page: "hr-cv-access",
    },
  ];

  return (
    <HRPortalLayout
      activePage={activePage}
      eyebrow="People Operations"
      title="HR Dashboard"
      onNavigate={onNavigate}
    >
      <section className="hr-summary-grid" aria-label="HR summary">
        {summaryCards.map((card) => (
          <article
            className={`hr-summary-card${card.editable ? " editable" : ""}${card.page ? " actionable" : ""}`}
            key={card.label}
            onClick={() => {
              if (card.page) {
                onNavigate(card.page);
              }
            }}
          >
            <div className="hr-summary-icon">{card.icon}</div>
            <span>{card.label}</span>
            {card.editable && (
              editingEmployees ? (
                <div className="hr-employee-edit" onClick={(event) => event.stopPropagation()}>
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    aria-label="Total employees"
                  />
                  <button type="button" className="save" onClick={handleSaveEmployees} aria-label="Save employee count">
                    <FaSave />
                  </button>
                  <button type="button" className="cancel" onClick={handleCancelEdit} aria-label="Cancel employee count edit">
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <button
                  className="hr-card-corner-action"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleEditEmployees();
                  }}
                  aria-label="Edit total employees"
                >
                  <FaEdit />
                </button>
              )
            )}
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
              <span>{leaveRequests.length}</span>
              <small>Requests</small>
            </div>
            <div className="leave-legend">
              {leaveBreakdown.map((item) => (
                <div key={item.label}>
                  <i style={{ background: item.color }} />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
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
            {notices.length > 0 ? (
              notices.map((notice) => (
                <p className="hr-dashboard-notice" key={notice.id}>
                  <strong>
                    {notice.title}
                    <small>{notice.date}</small>
                  </strong>
                  <span>{notice.body}</span>
                </p>
              ))
            ) : (
              <p>No notices created yet.</p>
            )}
          </div>
        </article>

        <article className="hr-panel notices-card">
          <div className="hr-panel-heading">
            <div>
              <span>Employee Accounts</span>
              <h2>Password Reset Requests</h2>
            </div>
            <FaLock />
          </div>
          <div className="hr-notice-list">
            {passwordResetRequests.length > 0 ? (
              passwordResetRequests.slice(0, 4).map((request) => (
                <p key={request.id}>
                  <strong>{request.name}</strong> requested a password change for{" "}
                  {request.email}. OTP: <strong>{request.otp}</strong>. Status:{" "}
                  {request.status}. {request.requestedAt}
                </p>
              ))
            ) : (
              <p>No employee password reset requests yet.</p>
            )}
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
              <strong>{attendancePercent}%</strong>
              <small>Present</small>
            </div>
            <div className="attendance-stats">
              {attendanceStats.map((item) => (
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
              <button type="button" key={action.label} onClick={() => onNavigate(action.page)}>
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
