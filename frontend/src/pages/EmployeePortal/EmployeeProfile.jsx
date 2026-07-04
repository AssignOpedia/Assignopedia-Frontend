import { useEffect, useRef, useState } from "react";
import {
  FaCamera,
  FaBuilding,
  FaEnvelope,
  FaIdBadge,
  FaLaptopCode,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import EmployeePortalLayout from "./EmployeePortalLayout";
import {
  moveEmployeeProfileImage,
  saveEmployeeProfileImage,
  useEmployeeProfileImage,
} from "./useEmployeeProfileImage";
import {
  getInitialsFromProfile,
  getPortalProfile,
  profileEvent,
  savePortalProfile,
} from "../../utils/profileStorage";
import { currentUserEvent, getCurrentUser } from "../../utils/authStorage";
import { uploadFileToCloudinary } from "../../utils/uploadApi";
import { getEmployeeEvent, loadEmployees } from "../../utils/organizationStorage";

const maxProfilePhotoSize = 1024 * 1024;

function EmployeeProfile({ activePage, onNavigate }) {
  const fileInputRef = useRef(null);
  const profileImage = useEmployeeProfileImage();
  const [profile, setProfile] = useState(() => getPortalProfile("employee"));
  const [statusMessage, setStatusMessage] = useState("");
  const [photoError, setPhotoError] = useState("");
  const employeeInitials = getInitialsFromProfile(profile);
  const details = [
    { label: "Employee ID", value: profile.employeeId, icon: <FaIdBadge /> },
    { label: "Department", value: profile.department, icon: <FaBuilding /> },
    { label: "Job Code", value: profile.jobCode, icon: <FaLaptopCode /> },
    { label: "Official Email", value: profile.email, icon: <FaEnvelope /> },
    { label: "Phone", value: profile.phone, icon: <FaPhoneAlt /> },
    { label: "Location", value: profile.location, icon: <FaMapMarkerAlt /> },
  ];

  useEffect(() => {
    const refreshProfile = () => {
      setProfile(getPortalProfile("employee"));
    };

    loadEmployees().then(refreshProfile).catch(() => {});
    window.addEventListener(getEmployeeEvent(), refreshProfile);
    window.addEventListener(profileEvent, refreshProfile);
    window.addEventListener(currentUserEvent, refreshProfile);

    return () => {
      window.removeEventListener(getEmployeeEvent(), refreshProfile);
      window.removeEventListener(profileEvent, refreshProfile);
      window.removeEventListener(currentUserEvent, refreshProfile);
    };
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setStatusMessage("");
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSave = (event) => {
    event.preventDefault();

    const previousUser = getCurrentUser();
    const savedProfile = savePortalProfile("employee", profile);
    const nextUser = getCurrentUser();

    moveEmployeeProfileImage(previousUser, nextUser);
    setProfile(savedProfile);
    setStatusMessage("Profile details saved successfully.");
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoError("");

    if (file.size > maxProfilePhotoSize) {
      setPhotoError("Profile picture must be 1 MB or smaller.");
      event.target.value = "";
      return;
    }

    setPhotoError("Uploading profile picture to Cloudinary...");

    try {
      const upload = await uploadFileToCloudinary(file, {
        folder: "assignopedia/profiles",
        resourceType: "image",
      });

      saveEmployeeProfileImage(upload.url);
      setPhotoError("");
    } catch (error) {
      setPhotoError(error.message || "Cloudinary upload failed.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <EmployeePortalLayout
      activePage={activePage}
      eyebrow="Employee Profile"
      title="Profile Overview"
      onNavigate={onNavigate}
    >
      <section className="portal-page-hero">
        <div className="profile-upload-wrap">
          <button
            className={`profile-photo profile-upload-trigger${profileImage ? " has-image" : ""}`}
            type="button"
            onClick={openFilePicker}
            aria-label="Upload profile picture"
          >
            {profileImage ? <img src={profileImage} alt={profile.name} /> : employeeInitials}
            <span className="profile-camera-icon" aria-hidden="true">
              <FaCamera />
            </span>
          </button>
          <button className="profile-upload-link" type="button" onClick={openFilePicker}>
            Upload Profile Picture
          </button>
          {photoError && <span className="request-error-text" role="alert">{photoError}</span>}
          <input
            ref={fileInputRef}
            className="profile-file-input"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleProfileImageChange}
          />
        </div>
        <div>
          <span>{profile.title}</span>
          <h2>{profile.name}</h2>
          <p>{profile.summary}</p>
        </div>
      </section>

      <section className="portal-card">
        <div className="card-heading">
          <div>
            <span>Edit Details</span>
            <h3>Update Employee Profile</h3>
          </div>
        </div>
        <form className="request-form" onSubmit={handleProfileSave}>
          <div className="request-form-row">
            <label><span>Full Name</span><input name="name" value={profile.name} onChange={handleProfileChange} required /></label>
            <label><span>Official Email</span><input type="email" name="email" value={profile.email} onChange={handleProfileChange} required /></label>
          </div>
          <div className="request-form-row">
            <label><span>Job Title</span><input name="title" value={profile.title} onChange={handleProfileChange} required /></label>
            <label><span>Employee ID</span><input name="employeeId" value={profile.employeeId} onChange={handleProfileChange} required /></label>
          </div>
          <div className="request-form-row">
            <label><span>Department</span><input name="department" value={profile.department} onChange={handleProfileChange} required /></label>
            <label><span>Job Code</span><input name="jobCode" value={profile.jobCode} onChange={handleProfileChange} required /></label>
          </div>
          <div className="request-form-row">
            <label><span>Phone</span><input name="phone" value={profile.phone} onChange={handleProfileChange} required /></label>
            <label><span>Location</span><input name="location" value={profile.location} onChange={handleProfileChange} required /></label>
          </div>
          <div className="request-form-row">
            <label><span>Availability</span><input name="availability" value={profile.availability} onChange={handleProfileChange} required /></label>
          </div>
          <label>
            <span>Professional Summary</span>
            <textarea name="summary" rows="4" value={profile.summary} onChange={handleProfileChange} required />
          </label>
          {statusMessage && <p className="request-success" role="status">{statusMessage}</p>}
          <button className="request-submit-btn" type="submit">Save Profile Details</button>
        </form>
      </section>

      <section className="portal-insight-grid">
        {details.map((item) => (
          <article
            className={`portal-card detail-card${item.label === "Official Email" ? " email-detail-card" : ""}`}
            key={item.label}
          >
            <div className="card-icon">{item.icon}</div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="portal-card">
          <div className="card-heading">
            <div>
              <span>About</span>
              <h3>Professional Summary</h3>
            </div>
          </div>
          <p className="portal-copy">{profile.summary}</p>
        </article>

        <article className="portal-card">
          <div className="card-heading">
            <div>
              <span>Status</span>
              <h3>Current Availability</h3>
            </div>
          </div>
          <div className="status-pill">{profile.availability}</div>
        </article>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeeProfile;
