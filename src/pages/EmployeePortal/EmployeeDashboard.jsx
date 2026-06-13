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
import EmployeePortalLayout from "./EmployeePortalLayout";
import { useEmployeeProfileImage } from "./useEmployeeProfileImage";

const attendanceCards = [
  { label: "Today's Login", value: "09:18 AM", note: "On time", icon: <FaClock /> },
  { label: "Logout Attendance", value: "06:42 PM", note: "Yesterday", icon: <FaRegCalendarAlt /> },
  { label: "Late Login", value: "02 Days", note: "This month", icon: <FaCalendarCheck /> },
  { label: "Leave Balance", value: "12 Days", note: "Available", icon: <FaListAlt /> },
  { label: "WFH Days", value: "04 Days", note: "Approved", icon: <FaLaptopHouse /> },
];

const workProgressBars = [
  { month: "Jan", value: 68, completed: "18K words" },
  { month: "Feb", value: 74, completed: "22K words" },
  { month: "Mar", value: 81, completed: "27K words" },
  { month: "Apr", value: 76, completed: "24K words" },
  { month: "May", value: 88, completed: "31K words" },
  { month: "Jun", value: 92, completed: "36K words" },
  { month: "Jul", value: 84, completed: "29K words" },
  { month: "Aug", value: 96, completed: "40K words" },
  { month: "Sep", value: 89, completed: "34K words" },
  { month: "Oct", value: 93, completed: "38K words" },
  { month: "Nov", value: 87, completed: "33K words" },
  { month: "Dec", value: 98, completed: "42K words" },
];

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

const announcements = [
  "Monthly townhall scheduled for Friday.",
  "New WFH policy is available in the HR portal.",
  "Performance review cycle opens next week.",
];

function EmployeeDashboard({ activePage, onNavigate }) {
  const profileImage = useEmployeeProfileImage();

  return (
    <EmployeePortalLayout
      activePage={activePage}
      eyebrow="Employee Dashboard"
      title="Welcome back, Sandipan"
      onNavigate={onNavigate}
    >
      <section className="employee-profile-banner">
        <div className="profile-main">
          <div className={`profile-photo${profileImage ? " has-image" : ""}`}>
            {profileImage ? <img src={profileImage} alt="Sandipan Mondal" /> : "SM"}
          </div>
          <div className="profile-copy">
            <span>Employee Profile</span>
            <h2>Sandipan Mondal</h2>
            <p>Technical Content Writer - Development Team</p>
            <div className="profile-tags">
              <span>Employee ID: EMP-240128</span>
              <span>Job Code: FE-12</span>
              <span>
                <FaEnvelope /> sandipan.aop0128@gmail.com
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
            <button type="button">
              View Work Report <FaChevronRight />
            </button>
          </div>
          <p className="chart-summary">Total work completed this year: 374K words</p>
          <div className="attendance-chart">
            {workProgressBars.map((item) => (
              <div className="chart-column" key={item.month} title={item.completed}>
                <span style={{ height: `${item.value}%` }} />
                <small>{item.month}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="portal-card performance-card">
          <div className="card-heading">
            <div>
              <span>Performance</span>
              <h3>Score Card</h3>
            </div>
          </div>
          <div className="score-orbit">
            <strong>92</strong>
            <span>Excellent</span>
          </div>
          <p>Quality, punctuality, collaboration, and task completion are above target this month.</p>
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
            {announcements.map((announcement) => (
              <p key={announcement}>{announcement}</p>
            ))}
          </div>
        </article>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeeDashboard;
