import { FaClipboardList } from "react-icons/fa";
import HRPortalLayout from "./HRPortalLayout";

const rows = [
  { name: "Sandipan Mondal", login: "09:18 AM", logout: "06:41 PM", status: "Present" },
  { name: "Priya Nair", login: "09:45 AM", logout: "06:30 PM", status: "Late" },
  { name: "Arjun Mehta", login: "-", logout: "-", status: "Absent" },
  { name: "Nisha Roy", login: "-", logout: "-", status: "On Leave" },
];

function HRAttendanceChecking({ activePage, onNavigate }) {
  return (
    <HRPortalLayout activePage={activePage} eyebrow="Attendance" title="Attendance Checking" onNavigate={onNavigate}>
      <article className="hr-panel">
        <div className="hr-panel-heading"><div><span>Today</span><h2>Employee Attendance</h2></div><FaClipboardList /></div>
        <div className="hr-table-wrap">
          <table className="hr-table">
            <thead><tr><th>Employee</th><th>Login</th><th>Logout</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td><td>{row.login}</td><td>{row.logout}</td>
                  <td><span className={`hr-status ${row.status.toLowerCase().replace(" ", "-")}`}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </HRPortalLayout>
  );
}

export default HRAttendanceChecking;
