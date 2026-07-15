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
  FaPlaneDeparture,
  FaSearch,
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import "./HRDashboard.css";
import { clearCurrentUser, getCurrentUser } from "../../utils/authStorage";
import { logoutAccountRemote } from "../../utils/authApi";
import {
  getPasswordResetRequests,
  getUnreadPasswordResetRequests,
  markPasswordResetRequestsRead,
  passwordResetRequestEvent,
} from "../../utils/passwordResetRequests";
import { getInitialsFromProfile, getPortalProfile } from "../../utils/profileStorage";
import {
  getCurrentHrNotifications,
  getCurrentHrUnreadNotifications,
  loadCurrentHrNotifications,
  markCurrentHrNotificationsRead,
  notificationEvent,
} from "../../utils/requestNotifications";
import { getHrSearchQuery, setHrSearchQuery } from "../../utils/hrSearch";

const sidebarItems = [
  { label: "Dashboard", icon: <FaHome />, page: "hr-dashboard" },
  { label: "Leave Request", icon: <FaPlaneDeparture />, page: "hr-leave-wfh" },
  { label: "Leave Approval", icon: <FaCalendarCheck />, page: "hr-leave-approval" },
  { label: "WFH Approval", icon: <FaLaptopHouse />, page: "hr-wfh-approval" },
  { label: "Attendance Checking", icon: <FaClipboardList />, page: "hr-attendance-checking" },
  { label: "Attendance", icon: <FaSignInAlt />, page: "hr-login-logout" },
  { label: "Notice Board", icon: <FaBell />, page: "hr-notice-board" },
  { label: "CV Access", icon: <FaFileAlt />, page: "hr-cv-access" },
  { label: "Employee ID", icon: <FaIdBadge />, page: "hr-employee-id" },
  { label: "Organization Structure", icon: <FaBuilding />, page: "hr-organization-structure" },
  { label: "Settings", icon: <FaCog />, page: "hr-settings" },
];

function HRPortalLayout({ activePage, children, eyebrow, title, onNavigate }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [requestNotifications, setRequestNotifications] = useState(getCurrentHrNotifications);
  const [passwordResetRequests, setPasswordResetRequests] = useState(getPasswordResetRequests);
  const [unreadRequestNotifications, setUnreadRequestNotifications] = useState(getCurrentHrUnreadNotifications);
  const [unreadPasswordResetRequests, setUnreadPasswordResetRequests] = useState(() =>
    getUnreadPasswordResetRequests("hr")
  );
  const [searchQuery, setSearchQuery] = useState(getHrSearchQuery);
  const notificationRef = useRef(null);
  const notificationCount = unreadPasswordResetRequests.length + unreadRequestNotifications.length;
  const hasNotifications = requestNotifications.length + passwordResetRequests.length > 0;
  const profile = getPortalProfile("hr");
  const profileImage = profile.imageUrl || profile.imageDataUrl || "";

  useEffect(() => {
    const refreshNotifications = () => {
      setRequestNotifications(getCurrentHrNotifications());
      setPasswordResetRequests(getPasswordResetRequests());
      setUnreadRequestNotifications(getCurrentHrUnreadNotifications());
      setUnreadPasswordResetRequests(getUnreadPasswordResetRequests("hr"));
    };

    loadCurrentHrNotifications()
      .then((notifications) => {
        setRequestNotifications(notifications);
        setUnreadRequestNotifications(getCurrentHrUnreadNotifications());
      })
      .catch(() => {});
    window.addEventListener(notificationEvent, refreshNotifications);
    window.addEventListener(passwordResetRequestEvent, refreshNotifications);
    window.addEventListener("storage", refreshNotifications);
    const refreshInterval = window.setInterval(() => {
      loadCurrentHrNotifications()
        .then((notifications) => {
          setRequestNotifications(notifications);
          setUnreadRequestNotifications(getCurrentHrUnreadNotifications());
        })
        .catch(() => {});
    }, 5000);

    const refreshOnFocus = () => {
      loadCurrentHrNotifications()
        .then((notifications) => {
          setRequestNotifications(notifications);
          setUnreadRequestNotifications(getCurrentHrUnreadNotifications());
        })
        .catch(() => {});
    };

    window.addEventListener("focus", refreshOnFocus);
    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener(notificationEvent, refreshNotifications);
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

  const handleLogout = async () => {
    const currentUser = getCurrentUser();

    if (currentUser?.email && currentUser?.role) {
      await logoutAccountRemote(currentUser).catch(() => {});
    }

    clearCurrentUser();
    onNavigate("hr-login");
  };

  const handleRequestNotificationClick = (notification) => {
    setShowNotifications(false);

    if (notification.hrEmail || notification.type === "HR Leave Decision") {
      onNavigate("hr-leave-wfh");
      return;
    }

    if (notification.type === "WFH") {
      onNavigate("hr-wfh-approval");
      return;
    }

    onNavigate("hr-leave-approval");
  };

  const handleNotificationToggle = () => {
    setShowNotifications((current) => {
      const next = !current;

      if (next) {
        Promise.all([
          markCurrentHrNotificationsRead(),
          markPasswordResetRequestsRead("hr"),
        ])
          .then(() => {
            setRequestNotifications(getCurrentHrNotifications());
            setPasswordResetRequests(getPasswordResetRequests());
            setUnreadRequestNotifications(getCurrentHrUnreadNotifications());
            setUnreadPasswordResetRequests(getUnreadPasswordResetRequests("hr"));
          })
          .catch(() => {});
      }

      return next;
    });
  };

  const handleSearchChange = (event) => {
    const nextQuery = event.target.value;

    setSearchQuery(nextQuery);
    setHrSearchQuery(nextQuery);
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
              <input
                type="search"
                placeholder="Search this HR section..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
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
                onClick={handleNotificationToggle}
              >
                <FaBell />
                {notificationCount > 0 && (
                  <span className="hr-notification-count">{notificationCount}</span>
                )}
              </button>

              {showNotifications && (
                <div className="hr-notification-panel" role="status">
                  <strong>Notifications</strong>
                  {hasNotifications ? (
                    <>
                      {requestNotifications.map((notification) => (
                        <button
                          className="hr-notification-item"
                          type="button"
                          key={notification.id}
                          onClick={() => handleRequestNotificationClick(notification)}
                        >
                          {notification.message ? (
                            <>
                              <span className="hr-notification-type">{notification.type || "Notification"}</span>
                              <span className="hr-notification-message">{notification.message}</span>
                              {notification.detail && <small>{notification.detail}</small>}
                            </>
                          ) : (
                            <>
                              <span className="hr-notification-type">{notification.type || "Notification"}</span>
                              <span className="hr-notification-message">
                                <b>{notification.employeeName}</b> sent {notification.type} request.
                              </span>
                              <small>{notification.date}{notification.detail ? ` | ${notification.detail}` : ""}</small>
                            </>
                          )}
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
            <div className="hr-profile">
              <div className={profileImage ? "has-image" : ""}>
                {profileImage ? <img src={profileImage} alt={profile.name} /> : getInitialsFromProfile(profile)}
              </div>
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
