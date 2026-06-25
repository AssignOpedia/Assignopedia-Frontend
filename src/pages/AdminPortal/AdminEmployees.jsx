import { useEffect, useState } from "react";
import { FaChartLine, FaEye, FaUserCheck, FaUserClock, FaUserMinus, FaUsers } from "react-icons/fa";
import { getPortalResource } from "../../utils/portalDataApi";
import AdminPortalLayout from "./AdminPortalLayout";

const fallbackEmployees = [
  { name: "Ananya Sen", role: "Project Lead", team: "Delivery", status: "Present", score: 94 },
  { name: "Rahul Verma", role: "Frontend Engineer", team: "Engineering", status: "Present", score: 89 },
  { name: "Meera Joshi", role: "QA Analyst", team: "Quality", status: "Absent", score: 82 },
  { name: "Arjun Mehta", role: "Sales Manager", team: "Revenue", status: "Present", score: 91 },
  { name: "Nisha Roy", role: "Support Specialist", team: "Support", status: "Absent", score: 77 },
];

function AdminEmployees({ activePage, onNavigate }) {
  const [employees, setEmployees] = useState(fallbackEmployees);

  useEffect(() => {
    getPortalResource("adminEmployees", fallbackEmployees).then((data) => {
      setEmployees(Array.isArray(data) && data.length ? data : fallbackEmployees);
    });
  }, []);

  const presentCount = employees.filter((employee) => employee.status === "Present").length;
  const absentCount = employees.filter((employee) => employee.status === "Absent").length;
  const averageScore = Math.round(
    employees.reduce((total, employee) => total + Number(employee.score || 0), 0) / Math.max(employees.length, 1)
  );

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
        <article className="admin-stat-card"><div><FaUsers /></div><span>Total Employees</span><strong>{employees.length}</strong><small>Backend directory</small></article>
        <article className="admin-stat-card"><div><FaUserCheck /></div><span>Present Today</span><strong>{presentCount}</strong><small>Synced status</small></article>
        <article className="admin-stat-card"><div><FaUserMinus /></div><span>Absent Today</span><strong>{absentCount}</strong><small>Synced status</small></article>
        <article className="admin-stat-card"><div><FaChartLine /></div><span>Avg Performance</span><strong>{averageScore}%</strong><small>Backend scores</small></article>
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
