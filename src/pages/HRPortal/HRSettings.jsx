import { useState } from "react";
import { FaBell, FaLock, FaUserTie } from "react-icons/fa";
import { getPortalProfile, savePortalProfile } from "../../utils/profileStorage";
import HRPortalLayout from "./HRPortalLayout";

function HRSettings({ activePage, onNavigate }) {
  const [profile, setProfile] = useState(() => getPortalProfile("hr"));
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setStatusMessage("");
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    setProfile(savePortalProfile("hr", profile));
    setStatusMessage("HR profile details saved successfully.");
  };

  return (
    <HRPortalLayout activePage={activePage} eyebrow="Settings" title="Settings" onNavigate={onNavigate}>
      <section className="hr-page-card-grid">
        <article className="hr-panel">
          <div className="hr-panel-heading"><div><span>Profile</span><h2>HR Profile Settings</h2></div><FaUserTie /></div>
          <form className="hr-form" onSubmit={handleSave}>
            <label><span>Name</span><input name="name" value={profile.name} onChange={handleChange} required /></label>
            <label><span>Email</span><input type="email" name="email" value={profile.email} onChange={handleChange} required /></label>
            <label><span>Role</span><input name="title" value={profile.title} onChange={handleChange} required /></label>
            <label><span>Department</span><input name="department" value={profile.department} onChange={handleChange} required /></label>
            <label><span>Phone</span><input name="phone" value={profile.phone} onChange={handleChange} required /></label>
            <label><span>Location</span><input name="location" value={profile.location} onChange={handleChange} required /></label>
            {statusMessage && <p className="request-success" role="status">{statusMessage}</p>}
            <button type="submit">Save Profile</button>
          </form>
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
