import { FaIdBadge } from "react-icons/fa";
import HRPortalLayout from "./HRPortalLayout";

function HREmployeeID({ activePage, onNavigate }) {
  return (
    <HRPortalLayout activePage={activePage} eyebrow="Employee ID" title="Employee ID" onNavigate={onNavigate}>
      <section className="hr-form-grid">
        <article className="hr-panel">
          <div className="hr-panel-heading"><div><span>Create</span><h2>Create Employee ID</h2></div><FaIdBadge /></div>
          <form className="hr-form">
            <label><span>Employee Name</span><input placeholder="Enter employee name" /></label>
            <label><span>Department</span><input placeholder="Department" /></label>
            <label><span>Job Code</span><input placeholder="Job code" /></label>
            <button type="button">Create ID</button>
          </form>
        </article>
        <article className="hr-panel">
          <div className="hr-panel-heading"><div><span>Edit</span><h2>Edit Employee ID</h2></div><FaIdBadge /></div>
          <form className="hr-form">
            <label><span>Employee ID</span><input placeholder="EMP-240128" /></label>
            <label><span>Official Email</span><input placeholder="employee@example.com" /></label>
            <button type="button">Update ID</button>
          </form>
        </article>
      </section>
    </HRPortalLayout>
  );
}

export default HREmployeeID;
