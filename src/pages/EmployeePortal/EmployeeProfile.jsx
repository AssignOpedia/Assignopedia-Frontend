import { useRef } from "react";
import {
  FaCamera,
  FaEnvelope,
  FaIdBadge,
  FaLaptopCode,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import EmployeePortalLayout from "./EmployeePortalLayout";
import {
  saveEmployeeProfileImage,
  useEmployeeProfileImage,
} from "./useEmployeeProfileImage";

const details = [
  { label: "Employee ID", value: "EMP-240128", icon: <FaIdBadge /> },
  { label: "Job Code", value: "FE-12", icon: <FaLaptopCode /> },
  { label: "Official Email", value: "sandipan.aop0128@gmail.com", icon: <FaEnvelope /> },
  { label: "Phone", value: "+91 98765 43210", icon: <FaPhoneAlt /> },
  { label: "Location", value: "Kolkata, India", icon: <FaMapMarkerAlt /> },
];

function EmployeeProfile({ activePage, onNavigate }) {
  const fileInputRef = useRef(null);
  const profileImage = useEmployeeProfileImage();

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      if (typeof imageData === "string") {
        saveEmployeeProfileImage(imageData);
      }
    };

    reader.readAsDataURL(file);
    event.target.value = "";
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
            {profileImage ? <img src={profileImage} alt="Sandipan Mondal" /> : "SM"}
            <span className="profile-camera-icon" aria-hidden="true">
              <FaCamera />
            </span>
          </button>
          <button className="profile-upload-link" type="button" onClick={openFilePicker}>
            Upload Profile Picture
          </button>
          <input
            ref={fileInputRef}
            className="profile-file-input"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleProfileImageChange}
          />
        </div>
        <div>
          <span>Technical Content Writer</span>
          <h2>Sandipan Mondal</h2>
          <p>Development Team member focused on technical documentation, frontend content, and delivery quality.</p>
        </div>
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
          <p className="portal-copy">Experienced technical content writer supporting Assignopedia with structured project writeups, user-focused documentation, and quality-first delivery.</p>
        </article>

        <article className="portal-card">
          <div className="card-heading">
            <div>
              <span>Status</span>
              <h3>Current Availability</h3>
            </div>
          </div>
          <div className="status-pill">Available for assigned work</div>
        </article>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeeProfile;
