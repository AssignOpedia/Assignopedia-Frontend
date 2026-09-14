import { useEffect, useRef, useState } from "react";
import {
  FaBell,
  FaBars,
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
  FaSignInAlt,
  FaUsers,
} from "react-icons/fa";
import "./AdminDashboard.css";
import {
  adminNotificationEvent,
  getAdminNotifications,
  getUnreadAdminNotifications,
  loadAdminNotifications,
  markAdminNotificationsRead,
} from "../../utils/adminNotifications";
import {
  getPasswordResetRequests,
  getUnreadPasswordResetRequests,
  markPasswordResetRequestsRead,
  passwordResetRequestEvent,
} from "../../utils/passwordResetRequests";
import { getInitialsFromProfile, getPortalProfile } from "../../utils/profileStorage";
import { getSearchQuery, setSearchQuery } from "../../utils/portalSearch";

const sidebarItems = [
  { label: "Dashboard", icon: <FaHome />, page: "admin-dashboard" },
  { label: "Employee Management", icon: <FaUsers />, page: "admin-employees" },
  { label: "HR Management", icon: <FaSignInAlt />, page: "admin-hr-login-logout" },
  { label: "Project Management", icon: <FaProjectDiagram />, page: "admin-projects" },
  { label: "Reports", icon: <FaFileAlt />, page: "admin-reports" },
  { label: "Blog Post", icon: <FaPenNib />, page: "admin-blog-posts" },
  { label: "Settings", icon: <FaCog />, page: "admin-settings" },
  { label: "System Management", icon: <FaShieldAlt />, page: "admin-system" },
];

function AdminPortalLayout({ activePage, children, title, eyebrow, description, action, onNavigate }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [passwordResetRequests, setPasswordResetRequests] = useState(getPasswordResetRequests);
  const [adminNotifications, setAdminNotifications] = useState(getAdminNotifications);
  const [unreadAdminNotifications, setUnreadAdminNotifications] = useState(getUnreadAdminNotifications);
  const [unreadPasswordResetRequests, setUnreadPasswordResetRequests] = useState(() =>
    getUnreadPasswordResetRequests("admin")
  );
  const [searchText, setSearchText] = useState(() => getSearchQuery("admin"));
  const notificationRef = useRef(null);
  const profile = getPortalProfile("admin");

  useEffect(() => {
    const refreshNotifications = () => {
      setPasswordResetRequests(getPasswordResetRequests());
      setAdminNotifications(getAdminNotifications());
      setUnreadPasswordResetRequests(getUnreadPasswordResetRequests("admin"));
      setUnreadAdminNotifications(getUnreadAdminNotifications());
    };

    loadAdminNotifications()
      .then((notifications) => {
        setAdminNotifications(notifications);
        setUnreadAdminNotifications(getUnreadAdminNotifications());
      })
      .catch(() => {});
    window.addEventListener(adminNotificationEvent, refreshNotifications);
    window.addEventListener(passwordResetRequestEvent, refreshNotifications);
    window.addEventListener("storage", refreshNotifications);
    const refreshInterval = window.setInterval(() => {
      loadAdminNotifications()
        .then((notifications) => {
          setAdminNotifications(notifications);
          setUnreadAdminNotifications(getUnreadAdminNotifications());
        })
        .catch(() => {});
    }, 5000);

    const refreshOnFocus = () => {
      loadAdminNotifications()
        .then((notifications) => {
          setAdminNotifications(notifications);
          setUnreadAdminNotifications(getUnreadAdminNotifications());
        })
        .catch(() => {});
    };

    window.addEventListener("focus", refreshOnFocus);
    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener(adminNotificationEvent, refreshNotifications);
      window.removeEventListener(passwordResetRequestEvent, refreshNotifications);
      window.removeEventListener("storage", refreshNotifications);
      window.removeEventListener("focus", refreshOnFocus);
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

  const handleSearchChange = (event) => {
    const nextQuery = event.target.value;

    setSearchText(nextQuery);
    setSearchQuery("admin", nextQuery);
  };

  const handleAdminNotificationClick = (notification) => {
    if (notification.targetPage === "admin-projects" || notification.projectId) {
      window.localStorage.setItem(
        "assignopedia-admin-project-target",
        JSON.stringify({
          projectId: notification.projectId || "",
          submissionId: notification.submissionId || "",
        })
      );
      setShowNotifications(false);
      onNavigate("admin-projects");
    }
  };

  const handleNotificationToggle = () => {
    setShowNotifications((current) => {
      const next = !current;

      if (next) {
        Promise.all([
          markAdminNotificationsRead(),
          markPasswordResetRequestsRead("admin"),
        ])
          .then(() => {
            setAdminNotifications(getAdminNotifications());
            setPasswordResetRequests(getPasswordResetRequests());
            setUnreadAdminNotifications(getUnreadAdminNotifications());
            setUnreadPasswordResetRequests(getUnreadPasswordResetRequests("admin"));
          })
          .catch(() => {});
      }

      return next;
    });
  };

  const notificationCount = unreadAdminNotifications.length + unreadPasswordResetRequests.length;
  const hasNotificationItems = adminNotifications.length + passwordResetRequests.length > 0;
  const navigateFromMenu = (page) => {
    setIsMobileMenuOpen(false);
    onNavigate(page);
  };

  return (
    <main className="admin-dashboard">
     <aside
  className={`admin-sidebar${isMobileMenuOpen ? " admin-sidebar-mobile-open" : ""}`}
  onMouseLeave={() => setIsMobileMenuOpen(false)}
>
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
              onClick={() => navigateFromMenu(item.page)}
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
      </aside>
      <button
        className={`portal-menu-backdrop${isMobileMenuOpen ? " visible" : ""}`}
        type="button"
        aria-label="Close navigation menu"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <section className="admin-workspace">
        <header className="admin-topbar">
          <button
            className="portal-mobile-menu-trigger"
            type="button"
            aria-label="Open admin navigation"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          >
            <FaBars aria-hidden="true" />
          </button>
          <label className="admin-search">
            <FaSearch aria-hidden="true" />
            <input
              type="search"
              placeholder="Search employees, projects, reports..."
              value={searchText}
              onChange={handleSearchChange}
            />
          </label>

          <div className="admin-topbar-actions">
            <div className="admin-notification-wrap" ref={notificationRef}>
              <button
                className="admin-icon-button"
                type="button"
                aria-label="Notifications"
                aria-expanded={showNotifications}
                onClick={handleNotificationToggle}
              >
                <FaBell />
                {notificationCount > 0 && (
                  <span className="admin-notification-count">{notificationCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="admin-notification-panel" role="status">
                  <strong>Notifications</strong>
                  {hasNotificationItems ? (
                    <>
                      {adminNotifications.map((notification) => (
                        <button
                          className="admin-notification-item"
                          type="button"
                          key={notification.id}
                          onClick={() => handleAdminNotificationClick(notification)}
                        >
                          <span>{notification.type || "Notification"}</span>
                          <strong>{notification.employeeName || "Employee"}</strong>
                          <small>{notification.projectTitle || "Submitted task"} | {notification.date || "Just now"}</small>
                          <em>Open Project Portfolio</em>
                        </button>
                      ))}
                      {passwordResetRequests.map((request) => (
                        <p key={request.id}>
                          {request.name} has sent OTP to change their account password.
                          OTP: <b>{request.otp}</b>
                        </p>
                      ))}
                    </>
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
