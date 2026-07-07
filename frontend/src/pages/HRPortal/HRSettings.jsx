import { useEffect, useRef, useState } from "react";
import { FaBell, FaCamera, FaLock, FaUserTie } from "react-icons/fa";
import { getInitialsFromProfile, getPortalProfile, savePortalProfile } from "../../utils/profileStorage";
import { getPortalResource, savePortalResource } from "../../utils/portalDataApi";
import { uploadFileToCloudinary } from "../../utils/uploadApi";
import HRPortalLayout from "./HRPortalLayout";

const defaultHrSettings = {
  passwordApproval: true,
  adminResetNotify: true,
  leaveAlerts: true,
  wfhAlerts: true,
  attendanceDigest: "Daily",
};
const maxProfilePhotoSize = 1024 * 1024;

function HRSettings({ activePage, onNavigate }) {
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(() => getPortalProfile("hr"));
  const [statusMessage, setStatusMessage] = useState("");
  const [photoMessage, setPhotoMessage] = useState("");
  const [settings, setSettings] = useState(defaultHrSettings);
  const profileImage = profile.imageUrl || profile.imageDataUrl || "";

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

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoMessage("");

    if (file.size > maxProfilePhotoSize) {
      setPhotoMessage("Profile picture must be 1 MB or smaller.");
      event.target.value = "";
      return;
    }

    setPhotoMessage("Uploading profile picture to Cloudinary...");

    try {
      const upload = await uploadFileToCloudinary(file, {
        folder: "assignopedia/profiles",
        resourceType: "image",
      });
      const nextProfile = {
        ...profile,
        imageDataUrl: upload.url,
        imageUrl: upload.url,
        imagePublicId: upload.publicId,
        imageResourceType: upload.resourceType || "image",
        imageName: upload.fileName || file.name,
      };

      setProfile(savePortalProfile("hr", nextProfile));
      setPhotoMessage("Profile picture updated successfully.");
    } catch (error) {
      setPhotoMessage(error.message || "Cloudinary upload failed.");
    } finally {
      event.target.value = "";
    }
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
          <div className="hr-profile-picture-settings">
            <button
              className={`hr-profile-picture${profileImage ? " has-image" : ""}`}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload HR profile picture"
            >
              {profileImage ? <img src={profileImage} alt={profile.name} /> : getInitialsFromProfile(profile)}
              <span aria-hidden="true"><FaCamera /></span>
            </button>
            <div>
              <button className="hr-profile-picture-upload" type="button" onClick={() => fileInputRef.current?.click()}>
                Upload Profile Picture
              </button>
              {photoMessage && <small>{photoMessage}</small>}
            </div>
            <input
              ref={fileInputRef}
              className="hr-profile-picture-input"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleProfileImageChange}
            />
          </div>
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
