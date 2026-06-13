import {
  FaBell,
  FaBullhorn,
  FaCalendarCheck,
  FaChartLine,
  FaHome,
  FaLaptopHouse,
  FaPowerOff,
  FaSearch,
  FaTasks,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import assignopediaLogo from "../../assets/logo.PNG";
import "./EmployeeDashboard.css";
import { useEmployeeProfileImage } from "./useEmployeeProfileImage";

const sidebarItems = [
  { label: "Dashboard", icon: <FaHome />, page: "employee-dashboard" },
  { label: "Profile", icon: <FaUser />, page: "employee-profile" },
  { label: "Attendance", icon: <FaCalendarCheck />, page: "employee-attendance" },
  { label: "Team", icon: <FaUsers />, page: "employee-team" },
  { label: "Leave / WFH", icon: <FaLaptopHouse />, page: "employee-leave-wfh" },
  { label: "Tasks", icon: <FaTasks />, page: "employee-tasks" },
  { label: "Performance", icon: <FaChartLine />, page: "employee-performance" },
  { label: "Notifications", icon: <FaBell />, page: "employee-notifications" },
  { label: "Logout", icon: <FaPowerOff />, page: "employee-login" },
];

function EmployeePortalLayout({ activePage, children, eyebrow, title, onNavigate }) {
  const profileImage = useEmployeeProfileImage();

  const handleMenuClick = (page) => {
    onNavigate(page);
  };

  return (
    <main className="employee-dashboard">
      <aside className="employee-sidebar">
        <div className="portal-brand">
          <img src={assignopediaLogo} alt="Assignopedia logo" />
          <div>
            <strong>Assignopedia</strong>
            <small>Employee Portal</small>
          </div>
        </div>

        <nav className="portal-menu" aria-label="Employee portal navigation">
          {sidebarItems.map((item) => (
            <button
              className={`portal-menu-item${activePage === item.page ? " active" : ""}`}
              type="button"
              key={item.label}
              onClick={() => handleMenuClick(item.page)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="employee-workspace">
        <header className="employee-topbar">
          <div>
            <span className="portal-eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
          </div>

          <div className="topbar-actions">
            <label className="portal-search">
              <FaSearch aria-hidden="true" />
              <input type="search" placeholder="Search projects, tasks..." />
            </label>
            <button className="topbar-icon-btn" type="button" aria-label="Notifications">
              <FaBell />
              <span />
            </button>
            <button className="topbar-icon-btn" type="button" aria-label="Announcements">
              <FaBullhorn />
            </button>
            <div className="topbar-profile">
              <div className={`avatar${profileImage ? " has-image" : ""}`}>
                {profileImage ? <img src={profileImage} alt="Sandipan Mondal" /> : "SM"}
              </div>
              <div>
                <strong>Sandipan Mondal</strong>
                <small>Technical Content Writer</small>
              </div>
            </div>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}

export default EmployeePortalLayout;
