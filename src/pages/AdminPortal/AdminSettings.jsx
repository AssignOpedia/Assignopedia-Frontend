import { FaBell, FaLock, FaSave, FaShieldAlt, FaUserCog } from "react-icons/fa";
import AdminPortalLayout from "./AdminPortalLayout";

function AdminSettings({ activePage, onNavigate }) {
  return (
    <AdminPortalLayout
      activePage={activePage}
      eyebrow="Portal preferences"
      title="Settings"
      description="Manage administrator profile preferences, notifications, and access control defaults."
      onNavigate={onNavigate}
      action={<button type="button"><FaSave /> Save Changes</button>}
    >
      <section className="admin-content-grid">
        <article className="admin-panel settings-profile">
          <div className="admin-panel-heading">
            <div><span>Profile</span><h2>Admin Profile Settings</h2></div>
            <FaUserCog />
          </div>
          <div className="settings-form">
            <label><span>Display Name</span><input value="Raj Da" readOnly /></label>
            <label><span>Email</span><input value="raj.admin@assignopedia.com" readOnly /></label>
            <label><span>Role</span><input value="Administrator" readOnly /></label>
          </div>
        </article>

        <article className="admin-panel settings-card">
          <div className="admin-panel-heading">
            <div><span>Alerts</span><h2>Notification Settings</h2></div>
            <FaBell />
          </div>
          <div className="toggle-list">
            <p><strong>Project delay alerts</strong><span className="toggle on" /></p>
            <p><strong>Revenue milestone alerts</strong><span className="toggle on" /></p>
            <p><strong>Daily attendance digest</strong><span className="toggle" /></p>
          </div>
        </article>

        <article className="admin-panel settings-card">
          <div className="admin-panel-heading">
            <div><span>Security</span><h2>Access Control Settings</h2></div>
            <FaShieldAlt />
          </div>
          <div className="toggle-list">
            <p><strong>Require two-step login</strong><span className="toggle on" /></p>
            <p><strong>Limit finance exports</strong><span className="toggle on" /></p>
            <p><strong>Allow manager role edits</strong><span className="toggle" /></p>
          </div>
        </article>

        <article className="admin-panel settings-card">
          <div className="admin-panel-heading">
            <div><span>Session</span><h2>Admin Access Rules</h2></div>
            <FaLock />
          </div>
          <div className="timeline-list">
            <p><strong>Session timeout</strong><span>30 min</span></p>
            <p><strong>Password rotation</strong><span>60 days</span></p>
            <p><strong>IP checks</strong><span>Enabled</span></p>
          </div>
        </article>
      </section>
    </AdminPortalLayout>
  );
}

export default AdminSettings;
