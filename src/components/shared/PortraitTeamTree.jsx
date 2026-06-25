import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AP";

function TeamTreeNode({ person, variant = "aqua", large = false, canManage = false, onEdit, onDelete }) {
  return (
    <div className={`portrait-node ${variant}${large ? " large" : ""}`}>
      {canManage && (
        <div className="portrait-node-actions">
          <button type="button" onClick={() => onEdit?.(person)} aria-label={`Edit ${person.name}`}>
            <FaEdit />
          </button>
          {!large && (
            <button type="button" className="danger" onClick={() => onDelete?.(person.id)} aria-label={`Delete ${person.name}`}>
              <FaTrash />
            </button>
          )}
        </div>
      )}
      <div className={`portrait-avatar ${person.imageDataUrl ? "has-image" : ""}`}>
        {person.imageDataUrl ? (
          <img src={person.imageDataUrl} alt={person.imageName || person.name} />
        ) : (
          <span>{getInitials(person.name)}</span>
        )}
      </div>
      <strong>{person.name}</strong>
      <small>{person.role}</small>
    </div>
  );
}

function PortraitTeamTree({ team, canManage = false, onEditLeader, onEditMember, onDeleteMember, onAddMember }) {
  return (
    <div className="team-portrait-tree">
      {canManage && (
        <button className="portrait-add-node" type="button" onClick={onAddMember}>
          <FaPlus /> Add Node
        </button>
      )}
      <div className="portrait-root">
        <TeamTreeNode person={team.leader} variant="coral" large canManage={canManage} onEdit={onEditLeader} />
      </div>

      <div className="portrait-branches" aria-hidden="true">
        <span className="branch top" />
        <span className="branch middle" />
        <span className="branch bottom" />
      </div>

      <div className="portrait-row portrait-row-top">
        {team.members.slice(0, 3).map((member) => (
          <TeamTreeNode
            person={member}
            variant="aqua"
            key={member.id}
            canManage={canManage}
            onEdit={onEditMember}
            onDelete={onDeleteMember}
          />
        ))}
      </div>

      <div className="portrait-row portrait-row-middle">
        {team.members.slice(3, 7).map((member) => (
          <TeamTreeNode
            person={member}
            variant="gold"
            key={member.id}
            canManage={canManage}
            onEdit={onEditMember}
            onDelete={onDeleteMember}
          />
        ))}
      </div>

      <div className="portrait-row portrait-row-bottom">
        {team.members.slice(7).map((member) => (
          <TeamTreeNode
            person={member}
            variant="violet"
            key={member.id}
            canManage={canManage}
            onEdit={onEditMember}
            onDelete={onDeleteMember}
          />
        ))}
      </div>
    </div>
  );
}

export default PortraitTeamTree;
