import { FaBell, FaPowerOff, FaShieldAlt } from "react-icons/fa";
import EmployeePortalLayout from "./EmployeePortalLayout";
import { clearCurrentUser, getCurrentUser } from "../../utils/authStorage";
import { logoutAccountRemote } from "../../utils/authApi";

function EmployeeSettings({ activePage, onNavigate }) {
  const handleLogout = async () => {
    const currentUser = getCurrentUser();

    if (currentUser?.email && currentUser?.role) {
      await logoutAccountRemote(currentUser).catch(() => {});
    }

    clearCurrentUser();
    onNavigate("employee-login");
  };

  return (
    <EmployeePortalLayout activePage={activePage} eyebrow="Settings" title="Settings" onNavigate={onNavigate}>
      <section className="portal-insight-grid">
        <article className="portal-card">
          <div className="card-heading"><div><span>Notifications</span><h3>Portal alerts</h3></div><FaBell /></div>
          <p className="portal-copy">Notifications for tasks, requests, and announcements appear in the portal header.</p>
        </article>
        <article className="portal-card">
          <div className="card-heading"><div><span>Security</span><h3>Account security</h3></div><FaShieldAlt /></div>
          <p className="portal-copy">Use the password reset option on the login screen whenever you need to update your password.</p>
        </article>
        <article className="portal-card portal-logout-card">
          <div className="card-heading"><div><span>Session</span><h3>Sign out securely</h3></div><FaPowerOff /></div>
          <p className="portal-copy">Sign out of this employee portal on this device.</p>
          <button className="portal-logout-action" type="button" onClick={handleLogout}><FaPowerOff /> Logout</button>
        </article>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeeSettings;
