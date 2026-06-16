import { FaChartLine, FaEye, FaUserCheck, FaUserClock, FaUserMinus, FaUsers } from "react-icons/fa";
import AdminPortalLayout from "./AdminPortalLayout";

const employees = [
  { name: "Ananya Sen", role: "Project Lead", team: "Delivery", status: "Present", score: 94 },
  { name: "Rahul Verma", role: "Frontend Engineer", team: "Engineering", status: "Present", score: 89 },
  { name: "Meera Joshi", role: "QA Analyst", team: "Quality", status: "Absent", score: 82 },
  { name: "Arjun Mehta", role: "Sales Manager", team: "Revenue", status: "Present", score: 91 },
  { name: "Nisha Roy", role: "Support Specialist", team: "Support", status: "Absent", score: 77 },
];

function AdminEmployees({ activePage, onNavigate }) {
  return (
    <AdminPortalLayout
      activePage={activePage}
      eyebrow="People operations"
      title="Employee Management"
      description="Review employee availability, profiles, and performance from one focused management view."
      onNavigate={onNavigate}
      action={<button type="button"><FaUsers /> Add Employee</button>}
    >
      <section className="admin-card-grid compact-grid">
        <article className="admin-stat-card"><div><FaUsers /></div><span>Total Employees</span><strong>248</strong><small>Across 9 teams</small></article>
        <article className="admin-stat-card"><div><FaUserCheck /></div><span>Present Today</span><strong>224</strong><small>90.3% attendance</small></article>
        <article className="admin-stat-card"><div><FaUserMinus /></div><span>Absent Today</span><strong>24</strong><small>8 approved leaves</small></article>
        <article className="admin-stat-card"><div><FaChartLine /></div><span>Avg Performance</span><strong>87%</strong><small>+4% this quarter</small></article>
      </section>

      <section className="admin-content-grid">
        <article className="admin-panel wide-panel">
          <div className="admin-panel-heading">
            <div><span>Directory</span><h2>Employee List</h2></div>
            <FaUsers />
          </div>
          <div className="admin-table employee-management-table">
            <div className="admin-table-head"><span>Employee</span><span>Team</span><span>Status</span><span>Performance</span><span>Action</span></div>
            {employees.map((employee) => (
              <div className="admin-table-row" key={employee.name}>
                <span><strong>{employee.name}</strong><small>{employee.role}</small></span>
                <span>{employee.team}</span>
                <em className={employee.status.toLowerCase()}>{employee.status}</em>
                <span className="admin-score">{employee.score}%</span>
                <button type="button"><FaEye /> View Details</button>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel side-panel">
          <div className="admin-panel-heading">
            <div><span>Summary</span><h2>Performance Summary</h2></div>
            <FaUserClock />
          </div>
          <div className="analytics-list">
            {["Delivery Quality", "Attendance Health", "Task Completion", "Peer Feedback"].map((label, index) => {
              const value = [92, 90, 86, 84][index];
              return (
                <div key={label}>
                  <p><span>{label}</span><strong>{value}%</strong></p>
                  <span className="admin-progress"><i style={{ width: `${value}%` }} /></span>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </AdminPortalLayout>
  );
}

export default AdminEmployees;
