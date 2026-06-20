import { useEffect, useRef, useState } from "react";
import {
  FaBell,
  FaBuilding,
  FaCalendarCheck,
  FaClipboardList,
  FaCog,
  FaFileAlt,
  FaHome,
  FaIdBadge,
  FaLaptopHouse,
  FaSearch,
  FaSignOutAlt,
} from "react-icons/fa";
import "./HRDashboard.css";
import { getPasswordResetRequests } from "../../utils/passwordResetRequests";
import { getInitialsFromProfile, getPortalProfile } from "../../utils/profileStorage";
import { getHrRequestNotifications, notificationEvent } from "../../utils/requestNotifications";

const sidebarItems = [
  { label: "Dashboard", icon: <FaHome />, page: "hr-dashboard" },
  { label: "Leave Approval", icon: <FaCalendarCheck />, page: "hr-leave-approval" },
  { label: "WFH Approval", icon: <FaLaptopHouse />, page: "hr-wfh-approval" },
  { label: "Attendance Checking", icon: <FaClipboardList />, page: "hr-attendance-checking" },
  { label: "Notice Board", icon: <FaBell />, page: "hr-notice-board" },
  { label: "CV Access", icon: <FaFileAlt />, page: "hr-cv-access" },
  { label: "Employee ID", icon: <FaIdBadge />, page: "hr-employee-id" },
  { label: "Organization Structure", icon: <FaBuilding />, page: "hr-organization-structure" },
  { label: "Settings", icon: <FaCog />, page: "hr-settings" },
];

function HRPortalLayout({ activePage, children, eyebrow, title, onNavigate }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [requestNotifications, setRequestNotifications] = useState(getHrRequestNotifications);
  const notificationRef = useRef(null);
  const passwordResetRequests = getPasswordResetRequests();
  const hasNotifications = passwordResetRequests.length > 0 || requestNotifications.length > 0;
  const profile = getPortalProfile("hr");

  useEffect(() => {
    const refreshNotifications = () => {
      setRequestNotifications(getHrRequestNotifications());
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

  const handleLogout = () => {
    localStorage.removeItem("hrSession");
    localStorage.removeItem("hrAuthToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    onNavigate("hr-login");
  };

  const handleRequestNotificationClick = (type) => {
    setShowNotifications(false);

    if (type === "WFH") {
      onNavigate("hr-wfh-approval");
      return;
    }

    onNavigate("hr-leave-approval");
  };

  return (
    <main className="hr-dashboard">
      <aside className="hr-sidebar">
        <div className="hr-brand">
          <span>HR</span>
          <div>
            <strong>Assignopedia</strong>
            <small>HR Portal</small>
          </div>
        </div>

        <nav className="hr-sidebar-menu" aria-label="HR portal navigation">
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

        <button className="hr-sidebar-logout" type="button" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </aside>

      <section className="hr-workspace">
        <header className="hr-topbar">
          <div>
            <span>{eyebrow}</span>
            <h1>{title}</h1>
          </div>

          <div className="hr-topbar-actions">
            <label className="hr-search">
              <FaSearch aria-hidden="true" />
              <input type="search" placeholder="Search employees, requests..." />
            </label>
            <div
              className="hr-notification-wrap"
              ref={notificationRef}
            >
              <button
                className="hr-icon-button"
                type="button"
                aria-label="Notifications"
                aria-expanded={showNotifications}
                onClick={() => setShowNotifications((current) => !current)}
              >
                <FaBell />
                {hasNotifications && <i />}
              </button>

              {showNotifications && (
                <div className="hr-notification-panel" role="status">
                  <strong>Notifications</strong>
                  {hasNotifications ? (
                    <>
                      {requestNotifications.slice(0, 5).map((notification) => (
                        <button
                          className="hr-notification-item"
                          type="button"
                          key={notification.id}
                          onClick={() => handleRequestNotificationClick(notification.type)}
                        >
                          <b>{notification.employeeName}</b> sent {notification.type} request on <b>{notification.date}</b>.
                          {notification.detail && <> {notification.detail}</>}
                        </button>
                      ))}
                      {passwordResetRequests.slice(0, 5).map((request) => (
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
            <div className="hr-profile">
              <div>{getInitialsFromProfile(profile)}</div>
              <span>
                <strong>{profile.name}</strong>
                <small>{profile.title}</small>
              </span>
            </div>
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}

export default HRPortalLayout;
