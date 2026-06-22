import { useEffect, useState } from "react";
import { FaIdBadge, FaTrash } from "react-icons/fa";
import { createEmployeeID, getEmployees, updateEmployeeID, deleteEmployee, getEmployeeEvent } from "../../utils/organizationStorage";
import { itemMatchesSearch, useHrSearchQuery } from "../../utils/hrSearch";
import HRPortalLayout from "./HRPortalLayout";

function HREmployeeID({ activePage, onNavigate }) {
  const [employees, setEmployees] = useState(() => getEmployees());
  const [createName, setCreateName] = useState("");
  const [createDept, setCreateDept] = useState("");
  const [createJobCode, setCreateJobCode] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [editId, setEditId] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const searchQuery = useHrSearchQuery();
  const filteredEmployees = employees.filter((employee) => itemMatchesSearch(employee, searchQuery));

  useEffect(() => {
    const refreshEmployees = () => {
      setEmployees(getEmployees());
    };

    const event = getEmployeeEvent();
    window.addEventListener(event, refreshEmployees);
    window.addEventListener("storage", refreshEmployees);

    return () => {
      window.removeEventListener(event, refreshEmployees);
      window.removeEventListener("storage", refreshEmployees);
    };
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();

    if (!createName.trim() || !createDept.trim() || !createJobCode.trim() || !createEmail.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const newEmployee = createEmployeeID(createName, createDept, createJobCode, createEmail);
    setEmployees(getEmployees());
    setCreateName("");
    setCreateDept("");
    setCreateJobCode("");
    setCreateEmail("");
    setSuccessMessage(`Employee ID ${newEmployee.id} created successfully!`);
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  const handleUpdate = (e) => {
    e.preventDefault();

    if (!editId.trim() || !editEmail.trim()) {
      alert("Please fill in all fields");
      return;
    }

    const updated = updateEmployeeID(editId, { email: editEmail });
    if (updated) {
      setEmployees(getEmployees());
      setEditId("");
      setEditEmail("");
      setSuccessMessage("Employee ID updated successfully!");
      setTimeout(() => setSuccessMessage(""), 2000);
    } else {
      alert("Employee ID not found");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this Employee ID?")) {
      deleteEmployee(id);
      setEmployees(getEmployees());
    }
  };

  return (
    <HRPortalLayout activePage={activePage} eyebrow="Employee ID" title="Employee ID" onNavigate={onNavigate}>
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

      <section className="hr-form-grid">
        <article className="hr-panel">
          <div className="hr-panel-heading">
            <div>
              <span>Create</span>
              <h2>Create Employee ID</h2>
            </div>
            <FaIdBadge />
          </div>
          <form className="hr-form" onSubmit={handleCreate}>
            <label>
              <span>Employee Name</span>
              <input
                placeholder="Enter employee name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </label>
            <label>
              <span>Department</span>
              <input
                placeholder="Department"
                value={createDept}
                onChange={(e) => setCreateDept(e.target.value)}
              />
            </label>
            <label>
              <span>Job Code</span>
              <input
                placeholder="Job code"
                value={createJobCode}
                onChange={(e) => setCreateJobCode(e.target.value)}
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                placeholder="employee@assignopedia.com"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
              />
            </label>
            <button type="submit">Create ID</button>
          </form>
        </article>

        <article className="hr-panel">
          <div className="hr-panel-heading">
            <div>
              <span>Edit</span>
              <h2>Edit Employee ID</h2>
            </div>
            <FaIdBadge />
          </div>
          <form className="hr-form" onSubmit={handleUpdate}>
            <label>
              <span>Employee ID</span>
              <input
                placeholder="EMP-240128"
                value={editId}
                onChange={(e) => setEditId(e.target.value)}
              />
            </label>
            <label>
              <span>Official Email</span>
              <input
                type="email"
                placeholder="employee@example.com"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </label>
            <button type="submit">Update ID</button>
          </form>
        </article>
      </section>

      {employees.length > 0 && (
        <article className="hr-panel" style={{ marginTop: "20px" }}>
          <div className="hr-panel-heading">
            <div>
              <span>Records</span>
              <h2>Created Employee IDs ({filteredEmployees.length})</h2>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.name}</td>
                    <td>{emp.department}</td>
                    <td>{emp.email}</td>
                    <td>{emp.createdAt}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        style={{
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                        }}
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6">No employee IDs match the current search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      )}
    </HRPortalLayout>
  );
}

export default HREmployeeID;
