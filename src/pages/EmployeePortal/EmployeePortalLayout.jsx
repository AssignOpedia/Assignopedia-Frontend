import { useEffect, useRef, useState } from "react";
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
import { clearCurrentUser } from "../../utils/authStorage";
import { getCurrentEmployeeNotifications, notificationEvent } from "../../utils/requestNotifications";
import { getInitialsFromProfile, getPortalProfile } from "../../utils/profileStorage";

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
  const [showNotifications, setShowNotifications] = useState(false);
  const profileImage = useEmployeeProfileImage();
  const [employeeNotifications, setEmployeeNotifications] = useState(getCurrentEmployeeNotifications);
  const notificationRef = useRef(null);
  const profile = getPortalProfile("employee");
  const employeeName = profile.name || "Employee";
  const employeeInitials = getInitialsFromProfile(profile);

  const handleMenuClick = (page) => {
    if (page === "employee-login") {
      clearCurrentUser();
    }

    onNavigate(page);
  };

  useEffect(() => {
    const refreshNotifications = () => {
      setEmployeeNotifications(getCurrentEmployeeNotifications());
    };

    window.addEventListener(notificationEvent, refreshNotifications);
    window.addEventListener("storage", refreshNotifications);
    return () => {
      window.removeEventListener(notificationEvent, refreshNotifications);
      window.removeEventListener("storage", refreshNotifications);
    };
  }, []);

  useEffect(() => {
    if (!showNotifications) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showNotifications]);

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
            <div
              className="employee-notification-wrap"
              ref={notificationRef}
            >
              <button
                className="topbar-icon-btn"
                type="button"
                aria-label="Notifications"
                aria-expanded={showNotifications}
                onClick={() => setShowNotifications((current) => !current)}
              >
                <FaBell />
                {employeeNotifications.length > 0 && (
                  <span className="portal-notification-count">{employeeNotifications.length}</span>
                )}
              </button>
              {showNotifications && (
                <div className="employee-notification-panel" role="status">
                  <strong>Notifications</strong>
                  {employeeNotifications.length > 0 ? (
                    employeeNotifications.slice(0, 5).map((notification) => (
                      <p key={notification.id}>{notification.message}</p>
                    ))
                  ) : (
                    <p>No new notifications.</p>
                  )}
                </div>
              )}
            </div>
            <button className="topbar-icon-btn" type="button" aria-label="Announcements">
              <FaBullhorn />
            </button>
            <div className="topbar-profile">
              <div className={`avatar${profileImage ? " has-image" : ""}`}>
                {profileImage ? <img src={profileImage} alt={employeeName} /> : employeeInitials}
              </div>
              <div>
                <strong>{employeeName}</strong>
                <small>{profile.title}</small>
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
