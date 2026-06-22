import { useEffect, useState } from "react";
import { FaBuilding, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../../utils/organizationStorage";
import { itemMatchesSearch, useHrSearchQuery } from "../../utils/hrSearch";
import HRPortalLayout from "./HRPortalLayout";

function HROrganizationStructure({ activePage, onNavigate }) {
  const [departments, setDepartments] = useState(() => getDepartments());
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [name, setName] = useState("");
  const [lead, setLead] = useState("");
  const [members, setMembers] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const searchQuery = useHrSearchQuery();
  const filteredDepartments = departments.filter((department) =>
    itemMatchesSearch(department, searchQuery)
  );

  useEffect(() => {
    const refreshDepts = () => {
      setDepartments(getDepartments());
    };

    window.addEventListener("assignopedia-organization-updated", refreshDepts);
    window.addEventListener("storage", refreshDepts);

    return () => {
      window.removeEventListener("assignopedia-organization-updated", refreshDepts);
      window.removeEventListener("storage", refreshDepts);
    };
  }, []);

  const handleOpenForm = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setName(dept.name);
      setLead(dept.lead);
      setMembers(dept.members);
    } else {
      setEditingDept(null);
      setName("");
      setLead("");
      setMembers("");
    }
    setShowForm(true);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!name.trim() || !lead.trim() || !members.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (editingDept) {
      updateDepartment(editingDept.id, { name, lead, members });
      setSuccessMessage("Department updated successfully!");
    } else {
      createDepartment(name, lead, members);
      setSuccessMessage("Department created successfully!");
    }

    setDepartments(getDepartments());
    setShowForm(false);
    setName("");
    setLead("");
    setMembers("");
    setEditingDept(null);

    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this department?")) {
      deleteDepartment(id);
      setDepartments(getDepartments());
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setName("");
    setLead("");
    setMembers("");
    setEditingDept(null);
  };

  return (
    <HRPortalLayout activePage={activePage} eyebrow="Organization" title="Organization Structure" onNavigate={onNavigate}>
      {successMessage && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#d1fae5",
            color: "#065f46",
            borderRadius: "6px",
            marginBottom: "16px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          ✓ {successMessage}
        </div>
      )}

      {showForm && (
        <article className="hr-panel" style={{ marginBottom: "20px" }}>
          <div className="hr-panel-heading">
            <div>
              <span>Edit</span>
              <h2>{editingDept ? "Edit Department" : "Create Department"}</h2>
            </div>
          </div>
          <form className="hr-form" onSubmit={handleSave} style={{ padding: "20px" }}>
            <label>
              <span>Department Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Development Team"
              />
            </label>
            <label>
              <span>Department Lead</span>
              <input
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                placeholder="e.g., Tapajit Da"
              />
            </label>
            <label>
              <span>Members</span>
              <input
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                placeholder="e.g., 12 Members"
              />
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {editingDept ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </article>
      )}

      <article className="hr-panel">
        <div className="hr-panel-heading">
          <div>
            <span>Departments</span>
            <h2>Department / Team Structure</h2>
          </div>
          <button
            className="hr-primary-action"
            type="button"
            onClick={() => handleOpenForm()}
          >
            <FaPlus /> Add Department
          </button>
        </div>
        <div className="hr-page-card-grid">
          {filteredDepartments.length > 0 ? filteredDepartments.map((department) => (
            <div
              className="hr-structure-card"
              key={department.id}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                padding: "16px",
              }}
            >
              <FaBuilding style={{ fontSize: "24px", marginBottom: "8px", color: "#2563eb" }} />
              <strong>{department.name}</strong>
              <span>{department.lead}</span>
              <small>{department.members}</small>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <button
                  onClick={() => handleOpenForm(department)}
                  style={{
                    background: "#dbeafe",
                    color: "#1e40af",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                  }}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(department.id)}
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                  }}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          )) : (
            <div className="hr-empty-state">No departments match the current search.</div>
          )}
        </div>
      </article>
    </HRPortalLayout>
  );
}

export default HROrganizationStructure;
