import { useEffect, useState } from "react";
import { FaChartLine, FaEye, FaUserCheck, FaUserClock, FaUserMinus, FaUsers } from "react-icons/fa";
import {
  attendanceEvent,
  formatAttendanceDateTime,
  getAttendanceRecords,
  getAttendanceStatusFromLogin,
  getEmployeeAttendanceRecords,
  getLateCountForRecord,
  getRecordDisplayName,
  getRecordRole,
  loadAttendanceRecords,
} from "../../utils/attendanceStorage";
import { getEmployeeEvent, getEmployees, loadEmployees } from "../../utils/organizationStorage";
import AdminPortalLayout from "./AdminPortalLayout";
import AdminRequestReview from "./AdminRequestReview";

const asAdminEmployee = (employee) => ({
  id: employee.id || employee.email || employee.name,
  name: employee.name || "Employee",
  role: employee.role || employee.jobCode || "Employee",
  team: employee.team || employee.department || "General",
  status: employee.status || "Present",
  score: Number(employee.score || 0),
  email: employee.email || "",
  taskCompletionScore: Number(employee.taskCompletionScore || employee.performance?.taskCompletion || 0),
  taskOnTimeScore: Number(employee.taskOnTimeScore || employee.performance?.deadlineReliability || 0),
  taskCompletedCount: Number(employee.taskCompletedCount || employee.performance?.completedTasks || 0),
  onTimeTaskCount: Number(employee.onTimeTaskCount || employee.performance?.onTimeTasks || 0),
  lateTaskCount: Number(employee.lateTaskCount || employee.performance?.lateTasks || 0),
});

const sortAttendanceRows = (records) =>
  [...records].sort((a, b) =>
    String(b.loginDateTime || b.logoutDateTime || b.date || "").localeCompare(
      String(a.loginDateTime || a.logoutDateTime || a.date || "")
    )
  );

function AdminEmployees({ activePage, onNavigate }) {
  const [employees, setEmployees] = useState(() => getEmployees().map(asAdminEmployee));
  const [attendanceRows, setAttendanceRows] = useState(() =>
    sortAttendanceRows(getEmployeeAttendanceRecords(getAttendanceRecords()))
  );

  useEffect(() => {
    const refreshEmployees = () => {
      setEmployees(getEmployees().map(asAdminEmployee));
    };

    const event = getEmployeeEvent();
    window.addEventListener(event, refreshEmployees);
    window.addEventListener("storage", refreshEmployees);
    loadEmployees().then(refreshEmployees).catch(() => {});
    const refreshInterval = window.setInterval(() => {
      loadEmployees().then(refreshEmployees).catch(() => {});
    }, 5000);

    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener(event, refreshEmployees);
      window.removeEventListener("storage", refreshEmployees);
    };
  }, []);

  useEffect(() => {
    const refreshAttendance = () => {
      setAttendanceRows(sortAttendanceRows(getEmployeeAttendanceRecords(getAttendanceRecords())));
    };

    loadAttendanceRecords().then(() => refreshAttendance()).catch(() => {});
    window.addEventListener(attendanceEvent, refreshAttendance);
    window.addEventListener("storage", refreshAttendance);

    return () => {
      window.removeEventListener(attendanceEvent, refreshAttendance);
      window.removeEventListener("storage", refreshAttendance);
    };
  }, []);

  const presentCount = employees.filter((employee) => employee.status === "Present").length;
  const absentCount = employees.filter((employee) => employee.status === "Absent").length;
  const averageScore = Math.round(
    employees.reduce((total, employee) => total + Number(employee.score || 0), 0) / Math.max(employees.length, 1)
  );
  const averageTaskCompletion = Math.round(
    employees.reduce((total, employee) => total + Number(employee.taskCompletionScore || 0), 0) / Math.max(employees.length, 1)
  );
  const averageDeadlineReliability = Math.round(
    employees.reduce((total, employee) => total + Number(employee.taskOnTimeScore || 0), 0) / Math.max(employees.length, 1)
  );
  const totalCompletedTasks = employees.reduce((total, employee) => total + Number(employee.taskCompletedCount || 0), 0);
  const totalLateTasks = employees.reduce((total, employee) => total + Number(employee.lateTaskCount || 0), 0);

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
          <div className="admin-table employee-management-table employee-directory-table">
            <div className="admin-table-head"><span>Employee</span><span>Team</span><span>Status</span><span>Performance</span><span>Action</span></div>
            {employees.length > 0 ? employees.map((employee) => (
              <div className="admin-table-row" key={employee.id}>
                <span><strong>{employee.name}</strong><small>{employee.role}</small></span>
                <span>{employee.team}</span>
                <em className={employee.status.toLowerCase()}>{employee.status}</em>
                <span className="admin-score">{employee.score}%</span>
                <button type="button"><FaEye /> View Details</button>
              </div>
            )) : (
              <div className="admin-table-row">
                <span><strong>No employees yet</strong><small>Employee logins and HR-created IDs will appear here.</small></span>
                <span>General</span>
                <em className="absent">Waiting</em>
                <span className="admin-score">0%</span>
                <button type="button" disabled><FaEye /> View Details</button>
              </div>
            )}
          </div>
        </article>

        <article className="admin-panel side-panel">
          <div className="admin-panel-heading">
            <div><span>Summary</span><h2>Performance Summary</h2></div>
            <FaUserClock />
          </div>
          <div className="analytics-list">
            {[
              ["Delivery Quality", averageScore],
              ["Deadline Reliability", averageDeadlineReliability],
              ["Task Completion", averageTaskCompletion],
              ["Completed / Late", totalCompletedTasks ? Math.round(((totalCompletedTasks - totalLateTasks) / totalCompletedTasks) * 100) : 0],
            ].map(([label, value]) => {
              return (
                <div key={label}>
                  <p><span>{label}</span><strong>{value}%</strong></p>
                  <span className="admin-progress"><i style={{ width: `${value}%` }} /></span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="admin-panel wide-panel">
          <div className="admin-panel-heading">
            <div><span>Attendance</span><h2>Employee Login / Logout Activity</h2></div>
            <FaUserClock />
          </div>
          <div className="admin-table employee-management-table attendance-management-table employee-attendance-activity-table">
            <div className="admin-table-head"><span>Employee</span><span>Job Role</span><span>Login</span><span>Logout</span><span>Late</span></div>
            {attendanceRows.length > 0 ? attendanceRows.map((record) => {
              const status = record.status || getAttendanceStatusFromLogin(record.loginTime);
              const lateCount = getLateCountForRecord(record, attendanceRows);

              return (
                <div className="admin-table-row" key={record.id || `${record.email}-${record.date}`}>
                  <span><strong>{getRecordDisplayName(record)}</strong><small>{record.email}</small></span>
                  <span>{getRecordRole(record)}</span>
                  <span>{formatAttendanceDateTime(record.loginDateTime, record.date, record.loginTime)}</span>
                  <span>{formatAttendanceDateTime(record.logoutDateTime, record.date, record.logoutTime)}</span>
                  <em className={status.toLowerCase()}>{lateCount ? `Late ${lateCount}` : status}</em>
                </div>
              );
            }) : (
              <div className="admin-table-row">
                <span><strong>No employee attendance yet</strong><small>Employee login/logout records will appear here.</small></span>
                <span>Employee</span><span>-</span><span>-</span><em className="remote">Waiting</em>
              </div>
            )}
          </div>
        </article>

        <AdminRequestReview
          requesterRole="employee"
          eyebrow="Employee Requests"
          title="Employee Leave and WFH Requests"
        />
      </section>
    </AdminPortalLayout>
  );
}

export default AdminEmployees;
