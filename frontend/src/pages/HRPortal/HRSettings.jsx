import { useEffect, useState } from "react";
import { FaBell, FaLock, FaUserTie } from "react-icons/fa";
import { getPortalProfile, savePortalProfile } from "../../utils/profileStorage";
import { getPortalResource, savePortalResource } from "../../utils/portalDataApi";
import HRPortalLayout from "./HRPortalLayout";

const defaultHrSettings = {
  passwordApproval: true,
  adminResetNotify: true,
  leaveAlerts: true,
  wfhAlerts: true,
  attendanceDigest: "Daily",
};

function HRSettings({ activePage, onNavigate }) {
  const [profile, setProfile] = useState(() => getPortalProfile("hr"));
  const [statusMessage, setStatusMessage] = useState("");
  const [settings, setSettings] = useState(defaultHrSettings);

  useEffect(() => {
    getPortalResource("settings", defaultHrSettings)
      .then((remoteSettings) => setSettings({ ...defaultHrSettings, ...(remoteSettings || {}) }))
      .catch(() => {});
  }, []);

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

  const saveSettings = (nextSettings) => {
    setSettings(nextSettings);
    savePortalResource("settings", nextSettings).catch(() => {});
  };

  const toggleSetting = (key) => {
    saveSettings({ ...settings, [key]: !settings[key] });
  };

  const toggleDigest = () => {
    saveSettings({
      ...settings,
      attendanceDigest: settings.attendanceDigest === "Daily" ? "Weekly" : "Daily",
    });
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
          <div className="hr-toggle-list">
            <button type="button" onClick={() => toggleSetting("passwordApproval")}><strong>Require HR approval for password reset</strong><span>{settings.passwordApproval ? "Enabled" : "Disabled"}</span></button>
            <button type="button" onClick={() => toggleSetting("adminResetNotify")}><strong>Notify admin on reset request</strong><span>{settings.adminResetNotify ? "Enabled" : "Disabled"}</span></button>
          </div>
        </article>
        <article className="hr-panel">
          <div className="hr-panel-heading"><div><span>Alerts</span><h2>Notification Settings</h2></div><FaBell /></div>
          <div className="hr-toggle-list">
            <button type="button" onClick={() => toggleSetting("leaveAlerts")}><strong>Leave approval alerts</strong><span>{settings.leaveAlerts ? "On" : "Off"}</span></button>
            <button type="button" onClick={() => toggleSetting("wfhAlerts")}><strong>WFH request alerts</strong><span>{settings.wfhAlerts ? "On" : "Off"}</span></button>
            <button type="button" onClick={toggleDigest}><strong>Attendance digest</strong><span>{settings.attendanceDigest}</span></button>
          </div>
        </article>
      </section>
    </HRPortalLayout>
  );
}

export default HRSettings;
