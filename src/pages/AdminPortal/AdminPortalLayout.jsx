import { useEffect, useRef, useState } from "react";
import {
  FaBell,
  FaBolt,
  FaCog,
  FaDatabase,
  FaFileAlt,
  FaHome,
  FaPenNib,
  FaProjectDiagram,
  FaRegCalendarAlt,
  FaSearch,
  FaShieldAlt,
  FaSignOutAlt,
  FaUsers,
  FaWallet,
} from "react-icons/fa";
import "./AdminDashboard.css";
import { getPasswordResetRequests, passwordResetRequestEvent } from "../../utils/passwordResetRequests";
import { getInitialsFromProfile, getPortalProfile } from "../../utils/profileStorage";

const sidebarItems = [
  { label: "Dashboard", icon: <FaHome />, page: "admin-dashboard" },
  { label: "Employee Management", icon: <FaUsers />, page: "admin-employees" },
  { label: "Project Management", icon: <FaProjectDiagram />, page: "admin-projects" },
  { label: "Revenue Tracking", icon: <FaWallet />, page: "admin-revenue" },
  { label: "Reports", icon: <FaFileAlt />, page: "admin-reports" },
  { label: "Blog Post", icon: <FaPenNib />, page: "admin-blog-posts" },
  { label: "Settings", icon: <FaCog />, page: "admin-settings" },
  { label: "System Management", icon: <FaShieldAlt />, page: "admin-system" },
];

function AdminPortalLayout({ activePage, children, title, eyebrow, description, action, onNavigate }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [passwordResetRequests, setPasswordResetRequests] = useState(getPasswordResetRequests);
  const notificationRef = useRef(null);
  const profile = getPortalProfile("admin");

  useEffect(() => {
    const refreshNotifications = () => {
      setPasswordResetRequests(getPasswordResetRequests());
    };

    window.addEventListener(passwordResetRequestEvent, refreshNotifications);
    window.addEventListener("storage", refreshNotifications);
    return () => {
      window.removeEventListener(passwordResetRequestEvent, refreshNotifications);
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

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    localStorage.removeItem("adminAuthToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    onNavigate("admin-login");
  };

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>AP</span>
          <div>
            <strong>Assignopedia</strong>
            <small>Admin Portal</small>
          </div>
        </div>

        <nav className="admin-menu" aria-label="Admin portal navigation">
          {sidebarItems.map((item) => (
            <button
              className={activePage === item.page ? "active" : ""}
              type="button"
              key={item.label}
              onClick={() => onNavigate(item.page)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <section className="admin-sidebar-card data-card">
          <FaDatabase />
          <strong>Data Overview</strong>
          <span>Live sync across employee, finance, and project modules.</span>
        </section>

        <section className="admin-sidebar-card access-card">
          <FaBolt />
          <strong>One Click Access</strong>
          <span>Open reports, permissions, and alerts from one control point.</span>
        </section>

        <button className="admin-sidebar-logout" type="button" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </aside>

      <section className="admin-workspace">
        <header className="admin-topbar">
          <label className="admin-search">
            <FaSearch aria-hidden="true" />
            <input type="search" placeholder="Search employees, projects, reports..." />
          </label>

          <div className="admin-topbar-actions">
            <div className="admin-notification-wrap" ref={notificationRef}>
              <button
                className="admin-icon-button"
                type="button"
                aria-label="Notifications"
                aria-expanded={showNotifications}
                onClick={() => setShowNotifications((current) => !current)}
              >
                <FaBell />
                {passwordResetRequests.length > 0 && (
                  <span className="admin-notification-count">{passwordResetRequests.length}</span>
                )}
              </button>

              {showNotifications && (
                <div className="admin-notification-panel" role="status">
                  <strong>Notifications</strong>
                  {passwordResetRequests.length > 0 ? (
                    passwordResetRequests.slice(0, 5).map((request) => (
                      <p key={request.id}>
                        {request.name} has sent OTP to change their account password.
                        OTP: <b>{request.otp}</b>
                      </p>
                    ))
                  ) : (
                    <p>No new notifications.</p>
                  )}
                </div>
              )}
            </div>

            <div className="admin-profile">
              <div>{getInitialsFromProfile(profile)}</div>
              <span>
                <strong>{profile.name}</strong>
                <small>{profile.title}</small>
              </span>
            </div>

            <label className="admin-filter">
              <FaRegCalendarAlt aria-hidden="true" />
              <select aria-label="Dashboard time range" defaultValue="3-month">
                <option value="1-month">1 Month</option>
                <option value="3-month">3 Months</option>
                <option value="6-month">6 Months</option>
                <option value="12-month">12 Months</option>
              </select>
            </label>
          </div>
        </header>

        <section className="admin-hero">
          <div>
            <span>{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {action}
        </section>

        {children}
      </section>
    </main>
  );
}

export default AdminPortalLayout;
