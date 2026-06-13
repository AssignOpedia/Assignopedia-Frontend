import { FaLaptopHouse } from "react-icons/fa";
import HRPortalLayout from "./HRPortalLayout";

const requests = [
  { name: "Nisha Roy", date: "Jun 18", task: "Content QA review", reason: "Home internet installation" },
  { name: "Rahul Das", date: "Jun 19", task: "Candidate screening", reason: "Medical appointment" },
  { name: "Sandipan Mondal", date: "Jun 20", task: "Technical content sprint", reason: "Focused documentation work" },
];

function HRWFHApproval({ activePage, onNavigate }) {
  return (
    <HRPortalLayout activePage={activePage} eyebrow="WFH Approval" title="WFH Approval" onNavigate={onNavigate}>
      <section className="hr-page-card-grid">
        {requests.map((request) => (
          <article className="hr-panel hr-request-card" key={request.name}>
            <div className="hr-panel-heading"><div><span>{request.date}</span><h2>{request.name}</h2></div><FaLaptopHouse /></div>
            <p><strong>Project / Task:</strong> {request.task}</p>
            <p><strong>Reason:</strong> {request.reason}</p>
            <div className="hr-action-pair"><button>Approve</button><button className="danger">Reject</button></div>
          </article>
        ))}
      </section>
    </HRPortalLayout>
  );
}

export default HRWFHApproval;
