import { FaBell, FaBullhorn } from "react-icons/fa";
import EmployeePortalLayout from "./EmployeePortalLayout";

const notifications = [
  "Your WFH request for Friday has been approved.",
  "New task assigned: Prepare frontend glossary draft.",
  "Performance review cycle opens next week.",
  "Monthly townhall scheduled for Friday.",
];

function EmployeeNotifications({ activePage, onNavigate }) {
  return (
    <EmployeePortalLayout activePage={activePage} eyebrow="Notifications" title="Notifications Center" onNavigate={onNavigate}>
      <section className="dashboard-grid">
        <article className="portal-card">
          <div className="card-heading"><div><span>Inbox</span><h3>Latest Notifications</h3></div><FaBell /></div>
          <div className="announcement-list">
            {notifications.map((item) => <p key={item}>{item}</p>)}
          </div>
        </article>
        <article className="portal-card">
          <div className="card-heading"><div><span>Announcements</span><h3>Company Updates</h3></div><FaBullhorn /></div>
          <div className="timeline-list">
            <p><strong>Policy Update</strong><span>WFH policy refreshed</span></p>
            <p><strong>Townhall</strong><span>Friday, 5:00 PM</span></p>
            <p><strong>HR Desk</strong><span>Open query window</span></p>
          </div>
        </article>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeeNotifications;
