import { useState } from "react";
import { FaPlus, FaSave, FaSitemap, FaTrash, FaUserTie, FaUsers } from "react-icons/fa";
import EmployeePortalLayout from "./EmployeePortalLayout";

const teamStorageKey = "assignopediaEmployeeTeam";

const defaultTeam = {
  leader: {
    name: "Tapajit Chakraborty",
    role: "Team Leader",
  },
  members: [
    { id: "supriyo-braman", name: "Supriyo Braman", role: "Technical Content Writer" },
    { id: "tuhin-paul", name: "Tuhin Paul", role: "Technical Content Writer" },
    { id: "tushar-paul", name: "Tushar Paul", role: "Technical Content Writer" },
    { id: "sayan-datta", name: "Sayan Datta", role: "Technical Content Writer" },
    { id: "sandipan-mondal", name: "Sandipan Mondal", role: "Technical Content Writer" },
    { id: "nisha-rajak", name: "Nisha Rajak", role: "Technical Content Writer" },
    { id: "paradeepti-sharma", name: "Paradeepti Sharma", role: "Technical Content Writer" },
    { id: "pratim-banerjee", name: "Pratim Banerjee", role: "Technical Content Writer" },
    { id: "sharmi-karmakar", name: "Sharmi Karmakar", role: "Technical Content Writer" },
  ],
};

const createTeamMember = () => ({
  id: `member-${Date.now()}`,
  name: "",
  role: "Technical Content Writer",
});

const getStoredTeam = () => {
  try {
    const savedTeam = JSON.parse(localStorage.getItem(teamStorageKey));

    if (savedTeam?.leader && Array.isArray(savedTeam.members)) {
      return savedTeam;
    }
  } catch {
    localStorage.removeItem(teamStorageKey);
  }

  return defaultTeam;
};

function EmployeeTeam({ activePage, onNavigate }) {
  const [team, setTeam] = useState(getStoredTeam);
  const [statusMessage, setStatusMessage] = useState("");

  const handleLeaderChange = (event) => {
    const { name, value } = event.target;

    setStatusMessage("");
    setTeam((current) => ({
      ...current,
      leader: {
        ...current.leader,
        [name]: value,
      },
    }));
  };

  const handleMemberChange = (memberId, field, value) => {
    setStatusMessage("");
    setTeam((current) => ({
      ...current,
      members: current.members.map((member) =>
        member.id === memberId ? { ...member, [field]: value } : member
      ),
    }));
  };

  const handleAddMember = () => {
    setStatusMessage("");
    setTeam((current) => ({
      ...current,
      members: [...current.members, createTeamMember()],
    }));
  };

  const handleRemoveMember = (memberId) => {
    setStatusMessage("");
    setTeam((current) => ({
      ...current,
      members: current.members.filter((member) => member.id !== memberId),
    }));
  };

  const handleSaveTeam = (event) => {
    event.preventDefault();

    const cleanedTeam = {
      leader: {
        name: team.leader.name.trim() || defaultTeam.leader.name,
        role: team.leader.role.trim() || defaultTeam.leader.role,
      },
      members: team.members
        .map((member) => ({
          ...member,
          name: member.name.trim(),
          role: member.role.trim() || "Team Member",
        }))
        .filter((member) => member.name),
    };

    localStorage.setItem(teamStorageKey, JSON.stringify(cleanedTeam));
    setTeam(cleanedTeam);
    setStatusMessage("Team details saved successfully.");
  };

  return (
    <EmployeePortalLayout activePage={activePage} eyebrow="Team" title="Team Structure & Hierarchy" onNavigate={onNavigate}>
      <section className="portal-insight-grid">
        <article className="portal-card detail-card">
          <div className="card-icon"><FaUserTie /></div>
          <span>Team Leader</span>
          <strong>{team.leader.name}</strong>
        </article>
        <article className="portal-card detail-card">
          <div className="card-icon"><FaUsers /></div>
          <span>Team Size</span>
          <strong>{team.members.length + 1} Members</strong>
        </article>
        <article className="portal-card detail-card">
          <div className="card-icon"><FaSitemap /></div>
          <span>Reporting Flow</span>
          <strong>Team Lead to Content Team</strong>
        </article>
      </section>

      <section className="portal-card team-hierarchy-card">
        <div className="card-heading">
          <div>
            <span>Team Structure</span>
            <h3>Hierarchy Reporting Flow</h3>
          </div>
        </div>
        <div className="team-flow">
          <div className="team-lead-card">
            <div className="card-icon"><FaUserTie /></div>
            <strong>{team.leader.name}</strong>
            <small>{team.leader.role}</small>
          </div>

          <div className="team-flow-connector" aria-hidden="true" />

          <div className="team-member-grid">
            {team.members.map((member) => (
              <div className="team-member-card" key={member.id}>
                <strong>{member.name}</strong>
                <small>{member.role}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="portal-card team-editor-card">
        <div className="card-heading">
          <div>
            <span>Edit Team</span>
            <h3>Team Members and Details</h3>
          </div>
          <button type="button" onClick={handleAddMember}>
            <FaPlus /> Add Member
          </button>
        </div>

        <form className="team-editor-form" onSubmit={handleSaveTeam}>
          <div className="team-editor-leader">
            <div className="card-icon"><FaUserTie /></div>
            <label>
              <span>Leader Name</span>
              <input name="name" value={team.leader.name} onChange={handleLeaderChange} required />
            </label>
            <label>
              <span>Leader Role</span>
              <input name="role" value={team.leader.role} onChange={handleLeaderChange} required />
            </label>
          </div>

          <div className="team-editor-list">
            {team.members.map((member, index) => (
              <div className="team-editor-row" key={member.id}>
                <span className="team-editor-index">{index + 1}</span>
                <label>
                  <span>Member Name</span>
                  <input
                    value={member.name}
                    onChange={(event) => handleMemberChange(member.id, "name", event.target.value)}
                    placeholder="Enter member name"
                    required
                  />
                </label>
                <label>
                  <span>Details / Role</span>
                  <input
                    value={member.role}
                    onChange={(event) => handleMemberChange(member.id, "role", event.target.value)}
                    placeholder="Enter role or details"
                    required
                  />
                </label>
                <button
                  className="team-editor-remove"
                  type="button"
                  onClick={() => handleRemoveMember(member.id)}
                  aria-label={`Remove ${member.name || "team member"}`}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {statusMessage && <p className="request-success" role="status">{statusMessage}</p>}
          <button className="request-submit-btn" type="submit">
            <FaSave /> Save Team Details
          </button>
        </form>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeeTeam;
