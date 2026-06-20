import { useState } from "react";
import { FaBell, FaLock, FaSave, FaShieldAlt, FaUserCog } from "react-icons/fa";
import { getPortalProfile, savePortalProfile } from "../../utils/profileStorage";
import AdminPortalLayout from "./AdminPortalLayout";

function AdminSettings({ activePage, onNavigate }) {
  const [profile, setProfile] = useState(() => getPortalProfile("admin"));
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setStatusMessage("");
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    setProfile(savePortalProfile("admin", profile));
    setStatusMessage("Admin profile details saved successfully.");
  };

  return (
    <AdminPortalLayout
      activePage={activePage}
      eyebrow="Portal preferences"
      title="Settings"
      description="Manage administrator profile preferences, notifications, and access control defaults."
      onNavigate={onNavigate}
      action={<button type="submit" form="admin-profile-form"><FaSave /> Save Changes</button>}
    >
      <section className="admin-content-grid">
        <article className="admin-panel settings-profile">
          <div className="admin-panel-heading">
            <div><span>Profile</span><h2>Admin Profile Settings</h2></div>
            <FaUserCog />
          </div>
          <form className="settings-form" id="admin-profile-form" onSubmit={handleSave}>
            <label><span>Display Name</span><input name="name" value={profile.name} onChange={handleChange} required /></label>
            <label><span>Email</span><input type="email" name="email" value={profile.email} onChange={handleChange} required /></label>
            <label><span>Role</span><input name="title" value={profile.title} onChange={handleChange} required /></label>
            <label><span>Department</span><input name="department" value={profile.department} onChange={handleChange} required /></label>
            <label><span>Phone</span><input name="phone" value={profile.phone} onChange={handleChange} required /></label>
            <label><span>Location</span><input name="location" value={profile.location} onChange={handleChange} required /></label>
            {statusMessage && <p className="request-success" role="status">{statusMessage}</p>}
            <button type="submit"><FaSave /> Save Profile</button>
          </form>
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
