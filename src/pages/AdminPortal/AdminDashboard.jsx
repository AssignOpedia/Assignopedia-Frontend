import {
  FaBriefcase,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaDownload,
  FaLayerGroup,
  FaProjectDiagram,
  FaSlidersH,
  FaStar,
  FaSyncAlt,
  FaUserCheck,
  FaUserMinus,
  FaUsers,
} from "react-icons/fa";
import AdminPortalLayout from "./AdminPortalLayout";

const dashboardCards = [
  { label: "Total Active Employees", value: "248", trend: "+12 this month", icon: <FaUsers /> },
  { label: "Present Today", value: "224", trend: "90.3% attendance", icon: <FaUserCheck /> },
  { label: "Absent Today", value: "24", trend: "8 on approved leave", icon: <FaUserMinus /> },
  { label: "Total Projects", value: "56", trend: "18 high priority", icon: <FaBriefcase /> },
  { label: "Total Revenue", value: "$1.84M", trend: "+18.4% QoQ", icon: <FaChartLine /> },
  { label: "Total Clients", value: "132", trend: "14 new clients", icon: <FaLayerGroup /> },
];

const employees = [
  { name: "Ananya Sen", role: "Project Lead", status: "Present", workload: "82%" },
  { name: "Rahul Verma", role: "Frontend Engineer", status: "Present", workload: "76%" },
  { name: "Meera Joshi", role: "QA Analyst", status: "Leave", workload: "64%" },
  { name: "Arjun Mehta", role: "Sales Manager", status: "Remote", workload: "71%" },
];

const revenueBars = [
  { month: "Apr", value: 52 },
  { month: "May", value: 68 },
  { month: "Jun", value: 74 },
  { month: "Jul", value: 61 },
  { month: "Aug", value: 86 },
  { month: "Sep", value: 92 },
];

const clientStats = [
  { label: "Enterprise", value: "46%", color: "#4f46e5" },
  { label: "SMB", value: "34%", color: "#06b6d4" },
  { label: "Startup", value: "20%", color: "#a855f7" },
];

const analytics = [
  { label: "Productivity", value: 88 },
  { label: "Attendance", value: 90 },
  { label: "Task Quality", value: 84 },
  { label: "SLA Health", value: 93 },
];

const projects = [
  { name: "Client ERP Migration", progress: 78, due: "24 Jun", health: "On Track" },
  { name: "Assignopedia LMS", progress: 64, due: "29 Jun", health: "Review" },
  { name: "Finance Automation", progress: 91, due: "02 Jul", health: "Ahead" },
];

const rankings = [
  { name: "Priya Kapoor", score: 98, team: "Delivery" },
  { name: "Sourav Das", score: 95, team: "Engineering" },
  { name: "Neha Iyer", score: 93, team: "Client Success" },
];

const teams = [
  { name: "Engineering", score: "91%", change: "+7%" },
  { name: "Operations", score: "86%", change: "+4%" },
  { name: "Sales", score: "82%", change: "+11%" },
  { name: "Support", score: "89%", change: "+5%" },
];

function AdminDashboard({ activePage, onNavigate }) {
  return (
    <AdminPortalLayout
      activePage={activePage}
      eyebrow="Central command center"
      title="Admin Dashboard"
      description="Track people, revenue, clients, projects, and system health from a single operational view."
      onNavigate={onNavigate}
      action={(
        <button type="button">
          <FaSyncAlt />
          Refresh Data
        </button>
      )}
    >
      <section className="admin-card-grid" aria-label="Admin dashboard cards">
        {dashboardCards.map((card) => (
          <article className="admin-stat-card" key={card.label}>
            <div>{card.icon}</div>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.trend}</small>
          </article>
        ))}
      </section>

      <section className="admin-content-grid">
        <article className="admin-panel employee-directory">
          <div className="admin-panel-heading">
            <div>
              <span>People</span>
              <h2>Employee Directory</h2>
            </div>
            <FaUsers />
          </div>
          <div className="employee-table">
            {employees.map((employee) => (
              <div className="employee-row" key={employee.name}>
                <span>
                  <strong>{employee.name}</strong>
                  <small>{employee.role}</small>
                </span>
                <em className={employee.status.toLowerCase()}>{employee.status}</em>
                <b>{employee.workload}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel revenue-overview">
          <div className="admin-panel-heading">
            <div>
              <span>Finance</span>
              <h2>Revenue Overview</h2>
            </div>
            <FaChartBar />
          </div>
          <div className="revenue-chart">
            {revenueBars.map((bar) => (
              <div key={bar.month}>
                <span style={{ height: `${bar.value}%` }} />
                <small>{bar.month}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel client-statistics">
          <div className="admin-panel-heading">
            <div>
              <span>Growth</span>
              <h2>Client Statistics</h2>
            </div>
            <FaChartPie />
          </div>
          <div className="client-stat-layout">
            <div className="client-donut">
              <strong>132</strong>
              <small>Clients</small>
            </div>
            <div className="client-legend">
              {clientStats.map((item) => (
                <p key={item.label}>
                  <i style={{ background: item.color }} />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </p>
              ))}
            </div>
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
            {rankings.map((person, index) => (
              <div key={person.name}>
                <b>{index + 1}</b>
                <span>
                  <strong>{person.name}</strong>
                  <small>{person.team}</small>
                </span>
                <em>{person.score}</em>
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
            <button type="button">Revenue Report</button>
            <button type="button">Project Report</button>
            <button type="button">Client Report</button>
          </div>
        </article>
      </section>
    </AdminPortalLayout>
  );
}

export default AdminDashboard;
