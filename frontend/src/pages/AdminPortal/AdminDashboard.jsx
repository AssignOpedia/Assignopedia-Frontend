import { useEffect, useState } from "react";
import {
  FaBriefcase,
  FaDownload,
  FaLayerGroup,
  FaLock,
  FaProjectDiagram,
  FaSlidersH,
  FaStar,
  FaSyncAlt,
  FaUserCheck,
  FaUserMinus,
  FaUsers,
} from "react-icons/fa";
import AdminPortalLayout from "./AdminPortalLayout";
import {
  attendanceEvent,
  getAttendanceRecords,
  getEmployeeAttendanceRecords,
  getHrAttendanceRecords,
  getRecordDisplayName,
  getRecordRole,
  getTodayKey,
  loadAttendanceRecords,
} from "../../utils/attendanceStorage";
import { getPasswordResetRequests } from "../../utils/passwordResetRequests";
import { getEmployeeEvent, getEmployees, loadEmployees } from "../../utils/organizationStorage";
import { getPortalResource } from "../../utils/portalDataApi";

const asDirectoryEmployee = (employee) => ({
  id: employee.id || employee.email || employee.name,
  name: employee.name || "Employee",
  role: employee.role || employee.jobCode || "Employee",
  status: employee.status || "Present",
  statusClass: String(employee.status || "Present").trim().toLowerCase().replace(/\s+/g, "-"),
  workload: `${Number(employee.score || 0)}%`,
  taskCompletionScore: Number(employee.taskCompletionScore || employee.performance?.taskCompletion || 0),
  taskOnTimeScore: Number(employee.taskOnTimeScore || employee.performance?.deadlineReliability || 0),
  performance: employee.performance || {},
});

const asHrDirectoryEmployee = (record) => {
  const status = record.loginTime ? "Present" : "Absent";
  const performance = record.loginTime ? 100 : 0;

  return {
    id: `hr-${record.id || record.email || record.date}`,
    name: getRecordDisplayName(record),
    role: getRecordRole(record),
    status,
    statusClass: String(status).trim().toLowerCase().replace(/\s+/g, "-"),
    workload: `${Number(record.score || record.performance || performance)}%`,
  };
};

const getPresentHrDirectoryRows = (records) => {
  const today = getTodayKey();

  return getHrAttendanceRecords(records)
    .filter((record) => record.date === today && record.loginTime)
    .map(asHrDirectoryEmployee);
};

const fallbackProjects = [
  { name: "Client ERP Migration", progress: 78, due: "24 Jun", health: "On Track" },
  { name: "Assignopedia LMS", progress: 64, due: "29 Jun", health: "Review" },
  { name: "Finance Automation", progress: 91, due: "02 Jul", health: "Ahead" },
];

const getDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.getTime();
};

const isDateInsideLeaveRequest = (request, dateKey) => {
  const range = String(request.dates || request.date || "");

  if (range.includes(dateKey)) {
    return true;
  }

  const [startText, endText] = range.split(" - ").map((part) => part?.trim());
  const target = getDateTime(`${dateKey}T00:00:00`);
  const start = getDateTime(`${startText}T00:00:00`);
  const end = getDateTime(`${(endText || startText)}T23:59:59`);

  return target !== null && start !== null && end !== null && target >= start && target <= end;
};

const teams = [
  { name: "Engineering", score: "91%", change: "+7%" },
  { name: "Operations", score: "86%", change: "+4%" },
  { name: "Sales", score: "82%", change: "+11%" },
  { name: "Support", score: "89%", change: "+5%" },
];

function AdminDashboard({ activePage, onNavigate }) {
  const [employees, setEmployees] = useState(() => getEmployees().map(asDirectoryEmployee));
  const [hrRows, setHrRows] = useState(() => getPresentHrDirectoryRows(getAttendanceRecords()));
  const [attendanceRecords, setAttendanceRecords] = useState(() => getAttendanceRecords());
  const [projects, setProjects] = useState(fallbackProjects);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const passwordResetRequests = getPasswordResetRequests();
  const directoryRows = [...hrRows, ...employees];
  const today = getTodayKey();
  const employeeAttendanceToday = getEmployeeAttendanceRecords(attendanceRecords).filter((record) => record.date === today);
  const presentToday = employeeAttendanceToday.filter((record) => record.loginTime).length;
  const totalActiveEmployees = employees.length;
  const absentToday = Math.max(totalActiveEmployees - presentToday, 0);
  const attendancePercent = totalActiveEmployees ? Math.round((presentToday / totalActiveEmployees) * 100) : 0;
  const approvedLeaveToday = leaveRequests.filter((request) => {
    const status = String(request.status || "").toLowerCase();
    const requesterRole = String(request.requesterRole || "employee").toLowerCase();

    return requesterRole === "employee" && status === "approved" && isDateInsideLeaveRequest(request, today);
  }).length;
  const activeProjects = projects.filter((project) => String(project.status || "Active").toLowerCase() !== "archived");
  const highPriorityProjects = activeProjects.filter((project) =>
    String(project.priority || project.health || "").toLowerCase().includes("high")
  ).length;
  const dashboardCards = [
    {
      label: "Total Active Employees",
      value: String(totalActiveEmployees),
      trend: totalActiveEmployees ? "Synced from employee accounts" : "No registered employees yet",
      icon: <FaUsers />,
    },
    {
      label: "Present Today",
      value: String(presentToday),
      trend: `${attendancePercent}% attendance`,
      icon: <FaUserCheck />,
    },
    {
      label: "Absent Today",
      value: String(absentToday),
      trend: `${approvedLeaveToday} on approved leave`,
      icon: <FaUserMinus />,
    },
    {
      label: "Total Projects",
      value: String(activeProjects.length),
      trend: highPriorityProjects ? `${highPriorityProjects} high priority` : "Synced project records",
      icon: <FaBriefcase />,
    },
  ];
  const rankedEmployees = [...employees]
    .filter((employee) => Number(employee.workload.replace("%", "")) > 0)
    .sort((a, b) => Number(b.workload.replace("%", "")) - Number(a.workload.replace("%", "")))
    .slice(0, 5);
  const averagePerformance = Math.round(
    employees.reduce((total, employee) => total + Number(employee.workload.replace("%", "") || 0), 0) / Math.max(employees.length, 1)
  );
  const averageTaskCompletion = Math.round(
    employees.reduce((total, employee) => total + Number(employee.taskCompletionScore || employee.performance?.taskCompletion || 0), 0) / Math.max(employees.length, 1)
  );
  const averageDeadlineReliability = Math.round(
    employees.reduce((total, employee) => total + Number(employee.taskOnTimeScore || employee.performance?.deadlineReliability || 0), 0) / Math.max(employees.length, 1)
  );
  const analytics = [
    { label: "Productivity", value: averagePerformance },
    { label: "Attendance", value: attendancePercent },
    { label: "Task Quality", value: averageTaskCompletion },
    { label: "SLA Health", value: averageDeadlineReliability },
  ];

  useEffect(() => {
    const refreshEmployees = () => {
      setEmployees(getEmployees().map(asDirectoryEmployee));
    };

    const event = getEmployeeEvent();
    window.addEventListener(event, refreshEmployees);
    window.addEventListener("storage", refreshEmployees);
    loadEmployees().then(refreshEmployees).catch(() => {});
    const refreshInterval = window.setInterval(() => {
      loadEmployees().then(refreshEmployees).catch(() => {});
    }, 5000);

    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener(event, refreshEmployees);
      window.removeEventListener("storage", refreshEmployees);
    };
  }, []);

  useEffect(() => {
    const refreshHrRows = () => {
      const records = getAttendanceRecords();

      setAttendanceRecords(records);
      setHrRows(getPresentHrDirectoryRows(records));
    };

    window.addEventListener(attendanceEvent, refreshHrRows);
    window.addEventListener("storage", refreshHrRows);
    loadAttendanceRecords().then((records) => {
      const nextRecords = Array.isArray(records) ? records : getAttendanceRecords();

      setAttendanceRecords(nextRecords);
      setHrRows(getPresentHrDirectoryRows(nextRecords));
    }).catch(() => {});

    return () => {
      window.removeEventListener(attendanceEvent, refreshHrRows);
      window.removeEventListener("storage", refreshHrRows);
    };
  }, []);

  useEffect(() => {
    const refreshDashboardResources = () => {
      Promise.all([
        getPortalResource("projects", fallbackProjects),
        getPortalResource("leaveRequests", []),
      ]).then(([projectData, leaveData]) => {
        setProjects(Array.isArray(projectData) ? projectData : fallbackProjects);
        setLeaveRequests(Array.isArray(leaveData) ? leaveData : []);
      });
    };

    refreshDashboardResources();
    window.addEventListener("hr-leave-request-updated", refreshDashboardResources);
    window.addEventListener("storage", refreshDashboardResources);

    return () => {
      window.removeEventListener("hr-leave-request-updated", refreshDashboardResources);
      window.removeEventListener("storage", refreshDashboardResources);
    };
  }, []);

  return (
    <AdminPortalLayout
      activePage={activePage}
      eyebrow="Central command center"
      title="Admin Dashboard"
      description="Track people, attendance, projects, and system health from a single operational view."
      onNavigate={onNavigate}
      action={(
        <button type="button">
          <FaSyncAlt />
          Refresh Data
        </button>
      )}
    >
      <section className="admin-card-grid admin-dashboard-card-grid" aria-label="Admin dashboard cards">
        {dashboardCards.map((card) => (
          <article className="admin-stat-card" key={card.label}>
            <div>{card.icon}</div>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.trend}</small>
          </article>
        ))}
      </section>

      <section className="admin-content-grid admin-dashboard-content-grid">
        <article className="admin-panel employee-directory">
          <div className="admin-panel-heading">
            <div>
              <span>People</span>
              <h2>Employee Directory</h2>
            </div>
            <FaUsers />
          </div>
          <div className="employee-table dashboard-employee-directory-list">
            {directoryRows.length > 0 ? directoryRows.map((employee) => (
              <div className="employee-row" key={employee.id}>
                <span>
                  <strong>{employee.name}</strong>
                  <small>{employee.role}</small>
                </span>
                <em className={employee.statusClass}>{employee.status}</em>
                <b>{employee.workload}</b>
              </div>
            )) : (
              <div className="employee-row">
                <span>
                  <strong>No people present yet.</strong>
                  <small>Employee and HR attendance will appear here.</small>
                </span>
                <em className="remote">Waiting</em>
                <b>0%</b>
              </div>
            )}
          </div>
        </article>

        <article className="admin-panel employee-directory">
          <div className="admin-panel-heading">
            <div>
              <span>Security</span>
              <h2>Password Reset Requests</h2>
            </div>
            <FaLock />
          </div>
          <div className="employee-table">
            {passwordResetRequests.length > 0 ? (
              passwordResetRequests.slice(0, 5).map((request) => (
                <div className="employee-row" key={request.id}>
                  <span>
                    <strong>{request.name}</strong>
                    <small>
                      {request.email} | OTP: {request.otp}
                    </small>
                  </span>
                  <em className="remote">{request.status}</em>
                  <b>{request.requestedAt}</b>
                </div>
              ))
            ) : (
              <div className="employee-row">
                <span>
                  <strong>No employee password reset requests yet.</strong>
                  <small>New employee requests will appear here.</small>
                </span>
              </div>
            )}
          </div>
        </article>

        <article className="admin-panel employee-analytics">
          <div className="admin-panel-heading">
            <div>
              <span>Workforce</span>
              <h2>Employee Analytics</h2>
            </div>
            <FaSlidersH />
          </div>
          <div className="analytics-list">
            {analytics.map((item) => (
              <div key={item.label}>
                <p>
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </p>
                <span className="admin-progress">
                  <i style={{ width: `${item.value}%` }} />
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel project-monitoring">
          <div className="admin-panel-heading">
            <div>
              <span>Delivery</span>
              <h2>Project Monitoring</h2>
            </div>
            <FaProjectDiagram />
          </div>
          <div className="project-list">
            {projects.map((project) => (
              <div key={project.name}>
                <p>
                  <strong>{project.name}</strong>
                  <span>{project.health}</span>
                </p>
                <small>Due {project.due}</small>
                <span className="admin-progress">
                  <i style={{ width: `${project.progress}%` }} />
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel performance-rankings">
          <div className="admin-panel-heading">
            <div>
              <span>Top Talent</span>
              <h2>Performance Rankings</h2>
            </div>
            <FaStar />
          </div>
          <div className="ranking-list">
            {(rankedEmployees.length ? rankedEmployees : employees.slice(0, 3)).map((person, index) => (
              <div key={person.id || person.name}>
                <b>{index + 1}</b>
                <span>
                  <strong>{person.name}</strong>
                  <small>{person.role}</small>
                </span>
                <em>{person.workload}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel team-comparison">
          <div className="admin-panel-heading">
            <div>
              <span>Teams</span>
              <h2>Team Comparison</h2>
            </div>
            <FaLayerGroup />
          </div>
          <div className="team-grid">
            {teams.map((team) => (
              <div key={team.name}>
                <span>{team.name}</span>
                <strong>{team.score}</strong>
                <small>{team.change}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel quick-report-generation">
          <div className="admin-panel-heading">
            <div>
              <span>Reports</span>
              <h2>Quick Report Generation</h2>
            </div>
            <FaDownload />
          </div>
          <div className="report-actions">
            <button type="button">Employee Report</button>
            <button type="button">Project Report</button>
            <button type="button">Attendance Report</button>
            <button type="button">System Report</button>
          </div>
        </article>
      </section>
    </AdminPortalLayout>
  );
}

export default AdminDashboard;
