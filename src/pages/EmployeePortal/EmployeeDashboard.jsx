import {
  FaBullhorn,
  FaCalendarCheck,
  FaCheckCircle,
  FaChevronRight,
  FaClock,
  FaEnvelope,
  FaLaptopHouse,
  FaListAlt,
  FaRegCalendarAlt,
  FaSitemap,
} from "react-icons/fa";
import { useEffect, useState } from "react";
import EmployeePortalLayout from "./EmployeePortalLayout";
import { useEmployeeProfileImage } from "./useEmployeeProfileImage";
import { getEmployeeDashboardMetrics } from "../../utils/employeeDashboardMetrics";
import { getEmployeeNotices, getNoticeDateTime, getNoticeEvent } from "../../utils/noticeStorage";
import { getInitialsFromProfile, getPortalProfile, profileEvent } from "../../utils/profileStorage";
import { currentUserEvent } from "../../utils/authStorage";
import { getEmployeeEvent, loadEmployees } from "../../utils/organizationStorage";

const projects = [
  { name: "Client Research Portal", progress: 82, status: "In Review" },
  { name: "Academic CRM Upgrade", progress: 64, status: "In Progress" },
  { name: "Content Quality Audit", progress: 91, status: "Final Checks" },
];

const tasks = [
  { title: "Submit weekly research summary", due: "Today, 4:00 PM" },
  { title: "Review assignment brief updates", due: "Tomorrow, 11:30 AM" },
  { title: "Update project tracker notes", due: "Friday, 2:00 PM" },
];

function EmployeeDashboard({ activePage, onNavigate }) {
  const [showWorkReport, setShowWorkReport] = useState(false);
  const [announcements, setAnnouncements] = useState(() => getEmployeeNotices());
  const [profile, setProfile] = useState(() => getPortalProfile("employee"));
  const profileImage = useEmployeeProfileImage();
  const dashboardMetrics = getEmployeeDashboardMetrics();
  const employeeName = profile.name || "Employee";
  const employeeInitials = getInitialsFromProfile(profile);
  const attendanceCards = [
    { label: "Today's Login", value: dashboardMetrics.cards.todayLogin, note: dashboardMetrics.notes.todayLogin, icon: <FaClock /> },
    { label: "Logout Attendance", value: dashboardMetrics.cards.logoutAttendance, note: dashboardMetrics.notes.logoutAttendance, icon: <FaRegCalendarAlt /> },
    { label: "Late Login", value: dashboardMetrics.cards.lateLogin, note: dashboardMetrics.notes.lateLogin, icon: <FaCalendarCheck /> },
    { label: "Leave Balance", value: dashboardMetrics.cards.leaveBalance, note: dashboardMetrics.notes.leaveBalance, icon: <FaListAlt /> },
    { label: "WFH Days", value: dashboardMetrics.cards.wfhDays, note: dashboardMetrics.notes.wfhDays, icon: <FaLaptopHouse /> },
  ];

  useEffect(() => {
    const refreshAnnouncements = () => {
      setAnnouncements(getEmployeeNotices());
    };
    const refreshProfile = () => {
      setProfile(getPortalProfile("employee"));
    };

    refreshAnnouncements();
    loadEmployees().then(refreshProfile).catch(() => {});
    window.addEventListener(getNoticeEvent(), refreshAnnouncements);
    window.addEventListener(getEmployeeEvent(), refreshProfile);
    window.addEventListener(profileEvent, refreshProfile);
    window.addEventListener(currentUserEvent, refreshProfile);
    window.addEventListener("storage", refreshAnnouncements);
    window.addEventListener("storage", refreshProfile);

    return () => {
      window.removeEventListener(getNoticeEvent(), refreshAnnouncements);
      window.removeEventListener(getEmployeeEvent(), refreshProfile);
      window.removeEventListener(profileEvent, refreshProfile);
      window.removeEventListener(currentUserEvent, refreshProfile);
      window.removeEventListener("storage", refreshAnnouncements);
      window.removeEventListener("storage", refreshProfile);
    };
  }, []);

  return (
    <EmployeePortalLayout
      activePage={activePage}
      eyebrow="Employee Dashboard"
      title={`Welcome back, ${employeeName}`}
      onNavigate={onNavigate}
    >
      <section className="employee-profile-banner">
        <div className="profile-main">
          <div className={`profile-photo${profileImage ? " has-image" : ""}`}>
            {profileImage ? <img src={profileImage} alt={employeeName} /> : employeeInitials}
          </div>
          <div className="profile-copy">
            <span>Employee Profile</span>
            <h2>{employeeName}</h2>
            <p>{profile.title}</p>
            <div className="profile-tags">
              <span>Employee ID: {profile.employeeId}</span>
              <span>Department: {profile.department}</span>
              <span>Job Code: {profile.jobCode}</span>
              <span>
                <FaEnvelope /> {profile.email}
              </span>
            </div>
          </div>
        </div>

      </section>

      <section className="attendance-grid" aria-label="Attendance summary">
        {attendanceCards.map((card) => (
          <article className="attendance-card" key={card.label}>
            <div className="card-icon">{card.icon}</div>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.note}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="portal-card chart-card">
          <div className="card-heading">
            <div>
              <span>Work Progress</span>
              <h3>Monthly Work Progress</h3>
            </div>
            <button type="button" onClick={() => setShowWorkReport((current) => !current)}>
              View Work Report <FaChevronRight />
            </button>
          </div>
          <div className="chart-summary-row">
            <p className="chart-summary">Total work completed this year: {dashboardMetrics.totalWorkHours}h</p>
            <span>Monthly completion trend</span>
          </div>
          <div className="attendance-chart professional-chart" aria-label="Monthly work progress chart">
            <div className="chart-y-axis" aria-hidden="true">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            <div className="chart-plot">
              {dashboardMetrics.workProgressBars.map((item) => (
                <div className="chart-column" key={item.month} title={item.completed}>
                  <div className="chart-bar-track">
                    <span className="chart-value">{item.value}%</span>
                    <i style={{ height: `${item.value}%` }} />
                  </div>
                  <small>{item.month}</small>
                </div>
              ))}
            </div>
          </div>
          {showWorkReport && (
            <div className="timeline-list">
              <p><strong>Present days</strong><span>{dashboardMetrics.workReport.presentDays}</span></p>
              <p><strong>Late logins</strong><span>{dashboardMetrics.workReport.lateLoginCount}</span></p>
              <p><strong>This month work</strong><span>{dashboardMetrics.workReport.monthlyWorkHours}h / {dashboardMetrics.workReport.monthlyTargetHours}h</span></p>
              <p><strong>Leave used</strong><span>{dashboardMetrics.workReport.leaveDaysUsed} days</span></p>
              <p><strong>WFH requests</strong><span>{dashboardMetrics.workReport.wfhDays}</span></p>
            </div>
          )}
        </article>

        <article className="portal-card performance-card">
          <div className="card-heading">
            <div>
              <span>Performance</span>
              <h3>Score Card</h3>
            </div>
          </div>
          <div
            className="score-orbit"
            style={{
              background: `radial-gradient(circle closest-side,#fff 69%,transparent 71%), conic-gradient(var(--portal-blue) ${dashboardMetrics.performance.score}%,rgba(11,34,85,.12) 0)`,
            }}
          >
            <strong>{dashboardMetrics.performance.score}</strong>
            <span>{dashboardMetrics.performance.label}</span>
          </div>
          <p>
            Score is calculated from punctuality, attendance, work progress, and collaboration activity this month.
          </p>
          <div className="timeline-list">
            <p><strong>Punctuality</strong><span>{dashboardMetrics.performance.punctualityScore}%</span></p>
            <p><strong>Attendance</strong><span>{dashboardMetrics.performance.attendanceScore}%</span></p>
            <p><strong>Work progress</strong><span>{dashboardMetrics.performance.workScore}%</span></p>
          </div>
        </article>

        <article className="portal-card projects-card">
          <div className="card-heading">
            <div>
              <span>Projects</span>
              <h3>Assigned Projects</h3>
            </div>
          </div>
          <div className="project-list">
            {projects.map((project) => (
              <div className="project-row" key={project.name}>
                <div>
                  <strong>{project.name}</strong>
                  <small>{project.status}</small>
                </div>
                <span>{project.progress}%</span>
                <div className="project-progress">
                  <i style={{ width: `${project.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="portal-card tasks-card">
          <div className="card-heading">
            <div>
              <span>Tasks</span>
              <h3>Pending Tasks</h3>
            </div>
          </div>
          <div className="task-list">
            {tasks.map((task) => (
              <div className="task-row" key={task.title}>
                <FaCheckCircle />
                <div>
                  <strong>{task.title}</strong>
                  <small>{task.due}</small>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="portal-card team-card">
          <div className="card-heading">
            <div>
              <span>Team</span>
              <h3>Structure</h3>
            </div>
            <FaSitemap />
          </div>
          <div className="team-stack">
            <div><strong>Tapajit Da</strong><small>Team Leader</small></div>
            <div><strong>Academic Operations</strong><small>12 Members</small></div>
            <div><strong>Content Strategy Pod</strong><small>4 Direct Collaborators</small></div>
          </div>
        </article>

        <article className="portal-card announcements-card">
          <div className="card-heading">
            <div>
              <span>Updates</span>
              <h3>Recent Announcements</h3>
            </div>
            <FaBullhorn />
          </div>
          <div className="announcement-list">
            {announcements.length > 0 ? (
              announcements.slice(0, 5).map((announcement) => (
                <p key={announcement.id}>
                  <strong>{announcement.title}</strong>
                  <small>{getNoticeDateTime(announcement)}</small>
                  <span>{announcement.body}</span>
                </p>
              ))
            ) : (
              <p>No recent announcements.</p>
            )}
          </div>
        </article>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeeDashboard;
