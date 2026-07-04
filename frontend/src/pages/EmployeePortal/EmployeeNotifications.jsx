import { FaBell, FaBullhorn } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getEmployeeNotices, getNoticeDateTime, getNoticeEvent } from "../../utils/noticeStorage";
import { getCurrentEmployeeNotifications, loadEmployeeNotifications, notificationEvent } from "../../utils/requestNotifications";
import EmployeePortalLayout from "./EmployeePortalLayout";

function EmployeeNotifications({ activePage, onNavigate }) {
  const [employeeNotifications, setEmployeeNotifications] = useState(() => getCurrentEmployeeNotifications());
  const [announcements, setAnnouncements] = useState(() => getEmployeeNotices());

  useEffect(() => {
    const refreshNotifications = () => {
      setEmployeeNotifications(getCurrentEmployeeNotifications());
    };

    loadEmployeeNotifications().then(refreshNotifications).catch(() => {});
    window.addEventListener(notificationEvent, refreshNotifications);
    window.addEventListener("storage", refreshNotifications);

    return () => {
      window.removeEventListener(notificationEvent, refreshNotifications);
      window.removeEventListener("storage", refreshNotifications);
    };
  }, []);

  useEffect(() => {
    const refreshAnnouncements = () => {
      setAnnouncements(getEmployeeNotices());
    };

    refreshAnnouncements();
    window.addEventListener(getNoticeEvent(), refreshAnnouncements);
    window.addEventListener("storage", refreshAnnouncements);

    return () => {
      window.removeEventListener(getNoticeEvent(), refreshAnnouncements);
      window.removeEventListener("storage", refreshAnnouncements);
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
                <p key={notification.id}>{notification.message}</p>
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
