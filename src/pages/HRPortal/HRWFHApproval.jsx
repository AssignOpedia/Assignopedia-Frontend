import { useState } from "react";
import { FaLaptopHouse } from "react-icons/fa";
import { addEmployeeDecisionNotification, formatNotificationDate } from "../../utils/requestNotifications";
import { itemMatchesSearch, useHrSearchQuery } from "../../utils/hrSearch";
import HRPortalLayout from "./HRPortalLayout";

const requests = [
  { name: "Nisha Roy", date: "Jun 18", task: "Content QA review", reason: "Home internet installation" },
  { name: "Rahul Das", date: "Jun 19", task: "Candidate screening", reason: "Medical appointment" },
  { name: "Sandipan Mondal", date: "Jun 20", task: "Technical content sprint", reason: "Focused documentation work" },
];

const wfhRequestStorageKey = "employeeWfhRequests";

const getStoredWfhRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(wfhRequestStorageKey) || "[]");
  } catch {
    return [];
  }
};

const getRequestKey = (request) =>
  request.id || `${request.email || request.name}-${request.date}-${request.task}-${request.reason}`;

function HRWFHApproval({ activePage, onNavigate }) {
  const [allRequests, setAllRequests] = useState(() => [...getStoredWfhRequests(), ...requests]);
  const searchQuery = useHrSearchQuery();
  const filteredRequests = allRequests.filter((request) => itemMatchesSearch(request, searchQuery));

  const updateWfhStatus = (request, status) => {
    const requestKey = getRequestKey(request);
    const decisionDate = formatNotificationDate();
    const storedRequests = getStoredWfhRequests();
    const updatedStoredRequests = storedRequests.map((storedRequest) =>
      getRequestKey(storedRequest) === requestKey
        ? { ...storedRequest, status, decisionDate }
        : storedRequest
    );

    localStorage.setItem(wfhRequestStorageKey, JSON.stringify(updatedStoredRequests));
    window.dispatchEvent(new CustomEvent("employee-wfh-request-updated"));
    setAllRequests((current) =>
      current.map((currentRequest) =>
        getRequestKey(currentRequest) === requestKey
          ? { ...currentRequest, status, decisionDate }
          : currentRequest
      )
    );

    if (request.email) {
      addEmployeeDecisionNotification({
        type: "WFH",
        employeeEmail: request.email,
        status,
        decisionDate,
        detail: `${request.task} on ${request.date}`,
      });
    }
  };

  return (
    <HRPortalLayout activePage={activePage} eyebrow="WFH Approval" title="WFH Approval" onNavigate={onNavigate}>
      <section className="hr-page-card-grid">
        {filteredRequests.length > 0 ? filteredRequests.map((request, index) => (
          <article className="hr-panel hr-request-card" key={`${request.name}-${request.date}-${index}`}>
            <div className="hr-panel-heading"><div><span>{request.date}</span><h2>{request.name}</h2></div><FaLaptopHouse /></div>
            <p><strong>Project / Task:</strong> {request.task}</p>
            <p><strong>Reason:</strong> {request.reason}</p>
            <p><strong>Status:</strong> <span className={`hr-status ${(request.status || "Pending").toLowerCase()}`}>{request.status || "Pending"}</span></p>
            {request.requestDate && <p><strong>Requested on:</strong> {request.requestDate}</p>}
            {request.decisionDate && <p><strong>Decision date:</strong> {request.decisionDate}</p>}
            <div className="hr-action-pair">
              <button type="button" onClick={() => updateWfhStatus(request, "Approved")}>Approve</button>
              <button className="danger" type="button" onClick={() => updateWfhStatus(request, "Rejected")}>Reject</button>
            </div>
          </article>
        )) : (
          <article className="hr-panel"><p className="hr-empty-state">No WFH requests match the current search.</p></article>
        )}
      </section>
    </HRPortalLayout>
  );
}

export default HRWFHApproval;
