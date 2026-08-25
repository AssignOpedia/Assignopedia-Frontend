import { useEffect, useRef, useState } from "react";
import {
  FaBell,
  FaBullhorn,
  FaCalendarCheck,
  FaChartLine,
  FaCog,
  FaHome,
  FaLaptopHouse,
  FaSearch,
  FaTasks,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import assignopediaLogo from "../../assets/logo.PNG";
import "./EmployeeDashboard.css";
import { useEmployeeProfileImage } from "./useEmployeeProfileImage";
import {
  getCurrentEmployeeUnreadNotices,
  getEmployeeNotices,
  getNoticeDateTime,
  getNoticeEvent,
  loadEmployeeNotices,
  markCurrentEmployeeNoticesRead,
} from "../../utils/noticeStorage";
import {
  getCurrentEmployeeNotifications,
  getCurrentEmployeeUnreadNotifications,
  loadEmployeeNotifications,
  markCurrentEmployeeNotificationsRead,
  notificationEvent,
} from "../../utils/requestNotifications";
import { getInitialsFromProfile, getPortalProfile } from "../../utils/profileStorage";
import { getSearchQuery, setSearchQuery } from "../../utils/portalSearch";
import { navigateFromEmployeeNotification } from "../../utils/employeeNotificationNavigation";

const sidebarItems = [
  { label: "Dashboard", icon: <FaHome />, page: "employee-dashboard" },
  { label: "Profile", icon: <FaUser />, page: "employee-profile" },
  { label: "Attendance", icon: <FaCalendarCheck />, page: "employee-attendance" },
  { label: "Team", icon: <FaUsers />, page: "employee-team" },
  { label: "Leave / WFH", icon: <FaLaptopHouse />, page: "employee-leave-wfh" },
  { label: "Tasks", icon: <FaTasks />, page: "employee-tasks" },
  { label: "Performance", icon: <FaChartLine />, page: "employee-performance" },
  { label: "Notifications", icon: <FaBell />, page: "employee-notifications" },
  { label: "Settings", icon: <FaCog />, page: "employee-settings" },
];

function EmployeePortalLayout({ activePage, children, eyebrow, title, onNavigate }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const profileImage = useEmployeeProfileImage();
  const [employeeNotifications, setEmployeeNotifications] = useState(getCurrentEmployeeNotifications);
  const [unreadEmployeeNotifications, setUnreadEmployeeNotifications] = useState(getCurrentEmployeeUnreadNotifications);
  const [announcements, setAnnouncements] = useState(() => getEmployeeNotices());
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(getCurrentEmployeeUnreadNotices);
  const [searchText, setSearchText] = useState(() => getSearchQuery("employee"));
  const notificationRef = useRef(null);
  const announcementRef = useRef(null);
  const profile = getPortalProfile("employee");
  const employeeName = profile.name || "Employee";
  const employeeInitials = getInitialsFromProfile(profile);

  const handleMenuClick = (page) => onNavigate(page);

  const handleSearchChange = (event) => {
    const nextQuery = event.target.value;

    setSearchText(nextQuery);
    setSearchQuery("employee", nextQuery);
  };

  useEffect(() => {
    const refreshNotifications = () => {
      setEmployeeNotifications(getCurrentEmployeeNotifications());
      setUnreadEmployeeNotifications(getCurrentEmployeeUnreadNotifications());
    };

    loadEmployeeNotifications().then(refreshNotifications).catch(() => {});
    window.addEventListener(notificationEvent, refreshNotifications);
    window.addEventListener("storage", refreshNotifications);
    return () => {
      window.removeEventListener(notificationEvent, refreshNotifications);
      window.removeEventListener("storage", refreshNotifications);
    };
  }, []);

  const handleNotificationToggle = (forceOpen) => {
    const shouldOpen = forceOpen ?? !showNotifications;

    setShowNotifications(shouldOpen);
    setShowAnnouncements(false);

    if (!shouldOpen || unreadEmployeeNotifications.length === 0) {
      return;
    }

    markCurrentEmployeeNotificationsRead(unreadEmployeeNotifications.map((notification) => notification.id))
      .then((notifications) => {
        setEmployeeNotifications(notifications);
        setUnreadEmployeeNotifications(getCurrentEmployeeUnreadNotifications());
      })
      .catch(() => {});
  };

  const handleNotificationClick = (notification) => {
    setShowNotifications(false);
    navigateFromEmployeeNotification(notification, onNavigate);
  };

  useEffect(() => {
    const refreshAnnouncements = () => {
      setAnnouncements(getEmployeeNotices());
      setUnreadAnnouncements(getCurrentEmployeeUnreadNotices());
    };

    loadEmployeeNotices().then(refreshAnnouncements).catch(() => {});
    window.addEventListener(getNoticeEvent(), refreshAnnouncements);
    window.addEventListener("storage", refreshAnnouncements);

    return () => {
      window.removeEventListener(getNoticeEvent(), refreshAnnouncements);
      window.removeEventListener("storage", refreshAnnouncements);
    };
  }, []);

  const handleAnnouncementToggle = (forceOpen) => {
    const shouldOpen = forceOpen ?? !showAnnouncements;

    setShowAnnouncements(shouldOpen);
    setShowNotifications(false);

    if (!shouldOpen || unreadAnnouncements.length === 0) {
      return;
    }

    markCurrentEmployeeNoticesRead(unreadAnnouncements.map((announcement) => announcement.id))
      .then((notices) => {
        setAnnouncements(notices);
        setUnreadAnnouncements(getCurrentEmployeeUnreadNotices());
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!showNotifications && !showAnnouncements) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (!notificationRef.current?.contains(event.target)) {
        setShowNotifications(false);
      }

      if (!announcementRef.current?.contains(event.target)) {
        setShowAnnouncements(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showNotifications, showAnnouncements]);

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
              <input
                type="search"
                placeholder="Search projects, tasks..."
                value={searchText}
                onChange={handleSearchChange}
              />
            </label>
            <div
              className="employee-notification-wrap"
              ref={notificationRef}
              onMouseEnter={() => handleNotificationToggle(true)}
              onMouseLeave={() => setShowNotifications(false)}
            >
              <button
                className="topbar-icon-btn"
                type="button"
                aria-label="Notifications"
                aria-expanded={showNotifications}
                onClick={() => handleNotificationToggle()}
              >
                <FaBell />
                {unreadEmployeeNotifications.length > 0 && (
                  <span className="portal-notification-count">{unreadEmployeeNotifications.length}</span>
                )}
              </button>
              {showNotifications && (
                <div className="employee-notification-panel" role="status">
                  <strong>Notifications</strong>
                  {employeeNotifications.length > 0 ? (
                    employeeNotifications.map((notification) => (
                      <button
                        className="employee-notification-entry"
                        type="button"
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <b>{notification.type || "Notification"}</b>
                        <small className="employee-announcement-meta">{notification.date}</small>
                        <span>{notification.message}</span>
                        {notification.detail && <span>{notification.detail}</span>}
                      </button>
                    ))
                  ) : (
                    <p>No new notifications.</p>
                  )}
                </div>
              )}
            </div>
            <div
              className="employee-notification-wrap"
              ref={announcementRef}
              onMouseEnter={() => handleAnnouncementToggle(true)}
              onMouseLeave={() => setShowAnnouncements(false)}
            >
              <button
                className="topbar-icon-btn"
                type="button"
                aria-label="Announcements"
                aria-expanded={showAnnouncements}
                onClick={() => handleAnnouncementToggle()}
              >
                <FaBullhorn />
                {unreadAnnouncements.length > 0 && (
                  <span className="portal-notification-count">{unreadAnnouncements.length}</span>
                )}
              </button>
              {showAnnouncements && (
                <div className="employee-notification-panel" role="status">
                  <strong>Recent Announcements</strong>
                  {announcements.length > 0 ? (
                    announcements.slice(0, 5).map((announcement) => (
                      <p key={announcement.id}>
                        <b>{announcement.title}</b>
                        <small className="employee-announcement-meta">
                          {getNoticeDateTime(announcement)}
                        </small>
                        {announcement.body && <span>{announcement.body}</span>}
                      </p>
                    ))
                  ) : (
                    <p>No recent announcements.</p>
                  )}
                </div>
              )}
            </div>
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
