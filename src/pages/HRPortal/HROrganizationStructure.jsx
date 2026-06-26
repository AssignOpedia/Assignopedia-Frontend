import { useEffect, useState } from "react";
import { FaBuilding, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, FaUpload, FaUsers } from "react-icons/fa";
import PortraitTeamTree from "../../components/shared/PortraitTeamTree";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../../utils/organizationStorage";
import { itemMatchesSearch, useHrSearchQuery } from "../../utils/hrSearch";
import { createTeamMember, getTeam, saveTeam, teamEvent } from "../../utils/teamStorage";
import { getCurrentUser } from "../../utils/authStorage";
import { uploadFileToCloudinary } from "../../utils/uploadApi";
import HRPortalLayout from "./HRPortalLayout";

function HROrganizationStructure({ activePage, onNavigate }) {
  const [departments, setDepartments] = useState(() => getDepartments());
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [name, setName] = useState("");
  const [lead, setLead] = useState("");
  const [members, setMembers] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [team, setTeam] = useState(() => getTeam());
  const [editingPerson, setEditingPerson] = useState(null);
  const [teamMessage, setTeamMessage] = useState("");
  const searchQuery = useHrSearchQuery();
  const isHrUser = String(getCurrentUser().role || "").toLowerCase() === "hr";
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

  useEffect(() => {
    const refreshTeam = () => setTeam(getTeam());

    window.addEventListener(teamEvent, refreshTeam);
    window.addEventListener("storage", refreshTeam);
    return () => {
      window.removeEventListener(teamEvent, refreshTeam);
      window.removeEventListener("storage", refreshTeam);
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

  const handleEditLeader = () => {
    if (!isHrUser) {
      return;
    }

    setEditingPerson({ ...team.leader, type: "leader" });
    setTeamMessage("");
  };

  const handleEditMember = (member) => {
    if (!isHrUser) {
      return;
    }

    setEditingPerson({ ...member, type: "member" });
    setTeamMessage("");
  };

  const handleTeamFieldChange = (field, value) => {
    setEditingPerson((current) => ({ ...current, [field]: value }));
  };

  const handleAddMember = () => {
    if (!isHrUser) {
      return;
    }

    const newMember = createTeamMember();
    const nextTeam = saveTeam({ ...team, members: [...team.members, newMember] });

    setTeam(nextTeam);
    setEditingPerson({ ...newMember, type: "member" });
    setTeamMessage("New node added. Update the details and save.");
  };

  const handleDeleteMember = (memberId) => {
    if (!isHrUser) {
      return;
    }

    const nextTeam = saveTeam({
      ...team,
      members: team.members.filter((member) => member.id !== memberId),
    });

    setTeam(nextTeam);
    setEditingPerson((current) => (current?.id === memberId ? null : current));
    setTeamMessage("Node deleted successfully.");
  };

  const handleTeamImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    const allowedExtension = /\.(png|jpe?g|webp)$/i.test(file.name);

    if (!allowedTypes.includes(file.type) || !allowedExtension) {
      setTeamMessage("Please upload a PNG, JPG, or WEBP team image.");
      event.target.value = "";
      return;
    }

    setTeamMessage("Uploading image to Cloudinary...");

    try {
      const upload = await uploadFileToCloudinary(file, {
        folder: "assignopedia/team",
        resourceType: "image",
      });

      setEditingPerson((current) => ({
        ...current,
        imageDataUrl: upload.url,
        imageUrl: upload.url,
        imagePublicId: upload.publicId,
        imageName: file.name,
      }));
      setTeamMessage("Image ready. Save to update the team circle.");
    } catch (error) {
      setTeamMessage(error.message || "Cloudinary upload failed.");
      event.target.value = "";
    }
  };

  const handleSavePerson = (event) => {
    event.preventDefault();

    if (!isHrUser) {
      setEditingPerson(null);
      return;
    }

    if (!editingPerson?.name?.trim()) {
      setTeamMessage("Please enter a node name.");
      return;
    }

    const cleanedPerson = {
      id: editingPerson.id,
      name: editingPerson.name.trim(),
      role: editingPerson.role.trim() || "Team Member",
      department: editingPerson.department?.trim() || "",
      initials: editingPerson.initials?.trim().toUpperCase().slice(0, 3) || "",
      imageDataUrl: editingPerson.imageDataUrl || "",
      imageName: editingPerson.imageName || "",
    };
    const nextTeam =
      editingPerson.type === "leader"
        ? saveTeam({ ...team, leader: { ...team.leader, ...cleanedPerson, id: "leader" } })
        : saveTeam({
            ...team,
            members: team.members.map((member) =>
              member.id === cleanedPerson.id ? { ...member, ...cleanedPerson } : member
            ),
          });

    setTeam(nextTeam);
    setEditingPerson(null);
    setTeamMessage("Team node updated successfully.");
  };

  const handleCancelPersonEdit = () => {
    setEditingPerson(null);
    setTeamMessage("");
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

      <article className="hr-panel hr-team-structure-panel">
        <div className="hr-panel-heading">
          <div>
            <span>Team</span>
            <h2>Team Structure</h2>
          </div>
          {isHrUser && (
            <button className="hr-primary-action" type="button" onClick={handleAddMember}>
              <FaPlus /> Add Node
            </button>
          )}
        </div>

        <PortraitTeamTree
          team={team}
          canManage={isHrUser}
          onEditLeader={handleEditLeader}
          onEditMember={handleEditMember}
          onDeleteMember={handleDeleteMember}
          onAddMember={handleAddMember}
        />

        {teamMessage && <p className="hr-success-banner" role="status">{teamMessage}</p>}

      </article>

      {editingPerson && isHrUser && (
        <div className="hr-team-modal-backdrop" role="presentation" onMouseDown={handleCancelPersonEdit}>
          <section
            className="hr-team-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-edit-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="hr-team-modal-close"
              type="button"
              onClick={handleCancelPersonEdit}
              aria-label="Close team member editor"
            >
              <FaTimes />
            </button>

            <form className="hr-form hr-team-edit-form" onSubmit={handleSavePerson}>
              <div className="hr-team-modal-heading">
                <span><FaUsers /></span>
                <div>
                  <small>Edit team card</small>
                  <h2 id="team-edit-title">
                    {editingPerson.type === "leader" ? "Edit Team Leader" : "Edit Team Member"}
                  </h2>
                </div>
              </div>

              <div className="hr-team-modal-grid">
                <label>
                  <span>Name</span>
                  <input
                    value={editingPerson.name}
                    onChange={(event) => handleTeamFieldChange("name", event.target.value)}
                    autoFocus
                    required
                  />
                </label>
                <label>
                  <span>Role / Designation</span>
                  <input
                    value={editingPerson.role}
                    onChange={(event) => handleTeamFieldChange("role", event.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>Team / Department</span>
                  <input
                    value={editingPerson.department || ""}
                    onChange={(event) => handleTeamFieldChange("department", event.target.value)}
                    placeholder="Enter team or department"
                  />
                </label>
                <label>
                  <span>Initials</span>
                  <input
                    value={editingPerson.initials || ""}
                    onChange={(event) => handleTeamFieldChange("initials", event.target.value)}
                    placeholder="e.g. RD"
                    maxLength="3"
                  />
                </label>
              </div>

              <label className="hr-team-image-upload">
                <span>Photo</span>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  onChange={handleTeamImageChange}
                />
                <small><FaUpload /> Upload image for this card</small>
              </label>

              {editingPerson.imageDataUrl && (
                <div className="hr-team-image-preview">
                  <img src={editingPerson.imageDataUrl} alt={editingPerson.imageName || editingPerson.name} />
                  <button type="button" onClick={() => setEditingPerson((current) => ({ ...current, imageDataUrl: "", imageName: "" }))}>
                    Remove Image
                  </button>
                </div>
              )}

              <div className="hr-team-modal-actions">
                <button className="outline" type="button" onClick={handleCancelPersonEdit}>
                  Cancel
                </button>
                <button type="submit"><FaSave /> Save Changes</button>
              </div>
            </form>
          </section>
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
