import { FaBuilding, FaEdit } from "react-icons/fa";
import HRPortalLayout from "./HRPortalLayout";

const departments = [
  { name: "Development Team", lead: "Tapajit Da", members: "12 Members" },
  { name: "Content Team", lead: "Ritika Sharma", members: "18 Members" },
  { name: "HR Operations", lead: "HR Admin", members: "5 Members" },
  { name: "Quality Review", lead: "Nisha Roy", members: "9 Members" },
];

function HROrganizationStructure({ activePage, onNavigate }) {
  return (
    <HRPortalLayout activePage={activePage} eyebrow="Organization" title="Organization Structure" onNavigate={onNavigate}>
      <article className="hr-panel">
        <div className="hr-panel-heading">
          <div><span>Departments</span><h2>Department / Team Structure</h2></div>
          <button className="hr-primary-action" type="button"><FaEdit /> Edit Structure</button>
        </div>
        <div className="hr-page-card-grid">
          {departments.map((department) => (
            <div className="hr-structure-card" key={department.name}>
              <FaBuilding />
              <strong>{department.name}</strong>
              <span>{department.lead}</span>
              <small>{department.members}</small>
            </div>
          ))}
        </div>
      </article>
    </HRPortalLayout>
  );
}

export default HROrganizationStructure;
