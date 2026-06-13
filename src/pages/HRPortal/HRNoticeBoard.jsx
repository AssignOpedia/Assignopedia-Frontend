import { FaPlus } from "react-icons/fa";
import HRPortalLayout from "./HRPortalLayout";

const notices = [
  { title: "Holiday Calendar Updated", date: "Jun 16", body: "The revised annual holiday list is now available." },
  { title: "Payroll Input Reminder", date: "Jun 18", body: "Submit payroll inputs before Friday 5 PM." },
  { title: "WFH Policy Update", date: "Jun 20", body: "WFH requests will be reviewed within one working day." },
];

function HRNoticeBoard({ activePage, onNavigate }) {
  return (
    <HRPortalLayout activePage={activePage} eyebrow="Notice Board" title="Notice Board" onNavigate={onNavigate}>
      <article className="hr-panel">
        <div className="hr-panel-heading">
          <div><span>Announcements</span><h2>Recent Notices</h2></div>
          <button className="hr-primary-action" type="button"><FaPlus /> Create Notice</button>
        </div>
        <div className="hr-notice-list rich">
          {notices.map((notice) => (
            <p key={notice.title}><strong>{notice.title}</strong><small>{notice.date}</small><span>{notice.body}</span></p>
          ))}
        </div>
      </article>
    </HRPortalLayout>
  );
}

export default HRNoticeBoard;
