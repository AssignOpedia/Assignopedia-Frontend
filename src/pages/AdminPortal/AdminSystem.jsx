import { FaBell, FaKey, FaShieldAlt, FaSignInAlt, FaUserShield, FaUsersCog } from "react-icons/fa";
import AdminPortalLayout from "./AdminPortalLayout";

const roles = [
  { role: "Super Admin", users: 2, access: "Full platform" },
  { role: "HR Admin", users: 5, access: "People operations" },
  { role: "Finance Admin", users: 3, access: "Revenue and reports" },
  { role: "Project Admin", users: 8, access: "Projects and delivery" },
];

const logins = [
  { user: "Raj Da", time: "09:12 AM", result: "Success" },
  { user: "Priya Kapoor", time: "08:58 AM", result: "Success" },
  { user: "Finance Bot", time: "02:14 AM", result: "Blocked" },
];

function AdminSystem({ activePage, onNavigate }) {
  return (
    <AdminPortalLayout
      activePage={activePage}
      eyebrow="Platform governance"
      title="System Management"
      description="Control user roles, permissions, system alerts, and recent admin login activity."
      onNavigate={onNavigate}
      action={<button type="button"><FaShieldAlt /> Run Audit</button>}
    >
      <section className="admin-content-grid">
        <article className="admin-panel wide-panel">
          <div className="admin-panel-heading">
            <div><span>Roles</span><h2>User Roles</h2></div>
            <FaUsersCog />
          </div>
          <div className="admin-table">
            <div className="admin-table-head"><span>Role</span><span>Users</span><span>Access</span></div>
            {roles.map((item) => (
              <div className="admin-table-row" key={item.role}><strong>{item.role}</strong><span>{item.users}</span><span>{item.access}</span></div>
            ))}
          </div>
        </article>

        <article className="admin-panel side-panel">
          <div className="admin-panel-heading">
            <div><span>Permissions</span><h2>Permissions</h2></div>
            <FaKey />
          </div>
          <div className="toggle-list">
            <p><strong>Employee edit access</strong><span className="toggle on" /></p>
            <p><strong>Revenue export access</strong><span className="toggle on" /></p>
            <p><strong>System delete access</strong><span className="toggle" /></p>
          </div>
        </article>

        <article className="admin-panel side-panel">
          <div className="admin-panel-heading">
            <div><span>Alerts</span><h2>System Alerts</h2></div>
            <FaBell />
          </div>
          <div className="alert-list">
            <p><strong>Backup completed</strong><span>Healthy</span></p>
            <p><strong>API latency spike</strong><span>Watch</span></p>
            <p><strong>Blocked login attempt</strong><span>Review</span></p>
          </div>
        </article>

        <article className="admin-panel wide-panel">
          <div className="admin-panel-heading">
            <div><span>Security</span><h2>Login Activity</h2></div>
            <FaSignInAlt />
          </div>
          <div className="admin-table">
            <div className="admin-table-head"><span>User</span><span>Time</span><span>Result</span></div>
            {logins.map((item) => (
              <div className="admin-table-row" key={`${item.user}-${item.time}`}><strong>{item.user}</strong><span>{item.time}</span><em className={item.result.toLowerCase()}>{item.result}</em></div>
            ))}
          </div>
        </article>

        <article className="admin-panel side-panel">
          <div className="admin-panel-heading">
            <div><span>Identity</span><h2>Access Health</h2></div>
            <FaUserShield />
          </div>
          <div className="client-donut system-donut"><strong>98%</strong><small>Secure</small></div>
        </article>
      </section>
    </AdminPortalLayout>
  );
}

export default AdminSystem;
