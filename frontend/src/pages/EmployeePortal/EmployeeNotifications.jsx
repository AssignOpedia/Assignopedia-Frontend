import { FaBell, FaBullhorn } from "react-icons/fa";
import { useEffect, useState } from "react";
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
  loadEmployeeNotifications,
  markCurrentEmployeeNotificationsRead,
  notificationEvent,
} from "../../utils/requestNotifications";
import EmployeePortalLayout from "./EmployeePortalLayout";

function EmployeeNotifications({ activePage, onNavigate }) {
  const [employeeNotifications, setEmployeeNotifications] = useState(() => getCurrentEmployeeNotifications());
  const [announcements, setAnnouncements] = useState(() => getEmployeeNotices());

  useEffect(() => {
    const refreshAndMarkNotificationsRead = () => {
      const notifications = getCurrentEmployeeNotifications();
      const unreadIds = notifications
        .filter((notification) => !notification.readAt)
        .map((notification) => notification.id);

      setEmployeeNotifications(notifications);

      if (unreadIds.length > 0) {
        markCurrentEmployeeNotificationsRead(unreadIds)
          .then(setEmployeeNotifications)
          .catch(() => {});
      }
    };

    loadEmployeeNotifications().then(refreshAndMarkNotificationsRead).catch(() => {});
    window.addEventListener(notificationEvent, refreshAndMarkNotificationsRead);
    window.addEventListener("storage", refreshAndMarkNotificationsRead);

    return () => {
      window.removeEventListener(notificationEvent, refreshAndMarkNotificationsRead);
      window.removeEventListener("storage", refreshAndMarkNotificationsRead);
    };
  }, []);

  useEffect(() => {
    const refreshAndMarkAnnouncementsRead = () => {
      const notices = getEmployeeNotices();
      const unreadNoticeIds = getCurrentEmployeeUnreadNotices().map((notice) => notice.id);

      setAnnouncements(notices);

      if (unreadNoticeIds.length > 0) {
        markCurrentEmployeeNoticesRead(unreadNoticeIds)
          .then(setAnnouncements)
          .catch(() => {});
      }
    };

    loadEmployeeNotices().then(refreshAndMarkAnnouncementsRead).catch(() => {});
    window.addEventListener(getNoticeEvent(), refreshAndMarkAnnouncementsRead);
    window.addEventListener("storage", refreshAndMarkAnnouncementsRead);

    return () => {
      window.removeEventListener(getNoticeEvent(), refreshAndMarkAnnouncementsRead);
      window.removeEventListener("storage", refreshAndMarkAnnouncementsRead);
    };
  }, []);

  return (
    <EmployeePortalLayout activePage={activePage} eyebrow="Notifications" title="Notifications Center" onNavigate={onNavigate}>
      <section className="dashboard-grid">
        <article className="portal-card">
          <div className="card-heading"><div><span>Inbox</span><h3>Latest Notifications</h3></div><FaBell /></div>
          <div className="announcement-list">
            {employeeNotifications.length > 0 ? (
              employeeNotifications.map((notification) => (
                <p key={notification.id}>
                  <strong>{notification.type || "Notification"}</strong>
                  <small>{notification.date}</small>
                  <span>{notification.message}</span>
                  {notification.detail && <span>{notification.detail}</span>}
                </p>
              ))
            ) : (
              <p>No employee notifications yet.</p>
            )}
          </div>
        </article>
        <article className="portal-card">
          <div className="card-heading"><div><span>Announcements</span><h3>Company Updates</h3></div><FaBullhorn /></div>
          <div className="announcement-list">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <p key={announcement.id}>
                  <strong>{announcement.title}</strong>
                  <small>{getNoticeDateTime(announcement)}</small>
                  <span>{announcement.body}</span>
                </p>
              ))
            ) : (
              <p>No company announcements yet.</p>
            )}
          </div>
        </article>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeeNotifications;
