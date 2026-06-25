import { FaPlus, FaSave, FaSitemap, FaTrash, FaUserTie, FaUsers } from "react-icons/fa";
import { useEffect, useState } from "react";
import PortraitTeamTree from "../../components/shared/PortraitTeamTree";
import { createTeamMember, getTeam, saveTeam, teamEvent } from "../../utils/teamStorage";
import EmployeePortalLayout from "./EmployeePortalLayout";

function EmployeeTeam({ activePage, onNavigate }) {
  const [team, setTeam] = useState(() => getTeam());
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const refreshTeam = () => setTeam(getTeam());

    window.addEventListener(teamEvent, refreshTeam);
    window.addEventListener("storage", refreshTeam);
    return () => {
      window.removeEventListener(teamEvent, refreshTeam);
      window.removeEventListener("storage", refreshTeam);
    };
  }, []);

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
        ...team.leader,
        id: "leader",
        name: team.leader.name.trim() || "Team Leader",
        role: team.leader.role.trim() || "Team Leader",
      },
      members: team.members
        .map((member) => ({
          ...member,
          name: member.name.trim(),
          role: member.role.trim() || "Team Member",
        }))
        .filter((member) => member.name),
    };

    setTeam(saveTeam(cleanedTeam));
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
            <h3>Organization Reporting Tree</h3>
          </div>
        </div>
        <PortraitTeamTree team={team} />
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
