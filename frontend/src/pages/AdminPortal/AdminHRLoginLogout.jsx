import { useEffect, useState } from "react";
import { FaSignInAlt } from "react-icons/fa";
import {
  attendanceEvent,
  formatAttendanceDateTime,
  getAttendanceRecords,
  getAttendanceStatusFromLogin,
  getHrAttendanceRecords,
  getLateCountForRecord,
  getRecordDisplayName,
  getRecordRole,
  loadAttendanceRecords,
} from "../../utils/attendanceStorage";
import AdminPortalLayout from "./AdminPortalLayout";
import AdminRequestReview from "./AdminRequestReview";

const sortRecords = (records) =>
  [...records].sort((a, b) =>
    String(b.loginDateTime || b.logoutDateTime || b.date || "").localeCompare(
      String(a.loginDateTime || a.logoutDateTime || a.date || "")
    )
  );

function AdminHRLoginLogout({ activePage, onNavigate }) {
  const [records, setRecords] = useState(() => sortRecords(getHrAttendanceRecords()));

  useEffect(() => {
    const refreshRecords = () => {
      setRecords(sortRecords(getHrAttendanceRecords(getAttendanceRecords())));
    };

    loadAttendanceRecords()
      .then((remoteRecords) => {
        setRecords(sortRecords(getHrAttendanceRecords(remoteRecords)));
      })
      .catch(() => {});

    window.addEventListener(attendanceEvent, refreshRecords);
    window.addEventListener("storage", refreshRecords);

    return () => {
      window.removeEventListener(attendanceEvent, refreshRecords);
      window.removeEventListener("storage", refreshRecords);
    };
  }, []);

  return (
    <AdminPortalLayout
      activePage={activePage}
      eyebrow="People security"
      title="HR Management"
      description="Review HR attendance and authentication activity captured through the backend attendance collection."
      onNavigate={onNavigate}
      action={<button type="button"><FaSignInAlt /> Live Records</button>}
    >
      <article className="admin-panel wide-panel">
        <div className="admin-panel-heading">
          <div><span>Authentication</span><h2>HR Management Records</h2></div>
          <FaSignInAlt />
        </div>
        <div className="admin-table employee-management-table attendance-management-table">
          <div className="admin-table-head"><span>Name</span><span>Role</span><span>Login</span><span>Logout</span><span>Late</span></div>
          {records.length > 0 ? records.map((record) => {
            const status = record.status || getAttendanceStatusFromLogin(record.loginTime);
            const lateCount = getLateCountForRecord(record, records);

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
              <span><strong>No HR records yet</strong><small>HR login/logout activity will appear here.</small></span>
              <span>Human Resources</span><span>-</span><span>-</span><em className="remote">Waiting</em>
            </div>
          )}
        </div>
      </article>

      <section className="admin-content-grid">
        <AdminRequestReview
          requesterRole="hr"
          eyebrow="HR Requests"
          title="HR Leave Requests"
          requestTypes={["leave"]}
        />
      </section>
    </AdminPortalLayout>
  );
}

export default AdminHRLoginLogout;
