import { FaBell, FaLock, FaUserTie } from "react-icons/fa";
import HRPortalLayout from "./HRPortalLayout";

function HRSettings({ activePage, onNavigate }) {
  return (
    <HRPortalLayout activePage={activePage} eyebrow="Settings" title="Settings" onNavigate={onNavigate}>
      <section className="hr-page-card-grid">
        <article className="hr-panel">
          <div className="hr-panel-heading"><div><span>Profile</span><h2>HR Profile Settings</h2></div><FaUserTie /></div>
          <form className="hr-form"><label><span>Name</span><input defaultValue="HR Admin" /></label><label><span>Email</span><input defaultValue="hr@assignopedia.com" /></label><button type="button">Save Profile</button></form>
        </article>
        <article className="hr-panel">
          <div className="hr-panel-heading"><div><span>Security</span><h2>Password Approval Settings</h2></div><FaLock /></div>
          <div className="hr-toggle-list"><p><strong>Require HR approval for password reset</strong><span>Enabled</span></p><p><strong>Notify admin on reset request</strong><span>Enabled</span></p></div>
        </article>
        <article className="hr-panel">
          <div className="hr-panel-heading"><div><span>Alerts</span><h2>Notification Settings</h2></div><FaBell /></div>
          <div className="hr-toggle-list"><p><strong>Leave approval alerts</strong><span>On</span></p><p><strong>WFH request alerts</strong><span>On</span></p><p><strong>Attendance digest</strong><span>Daily</span></p></div>
        </article>
      </section>
    </HRPortalLayout>
  );
}

export default HRSettings;
