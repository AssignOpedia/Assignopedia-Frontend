import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

const getInitials = (person) =>
  (person.initials || person.name || "")
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
          <span>{getInitials(person)}</span>
        )}
      </div>
      <strong>{person.name}</strong>
      <small>{person.role}</small>
    </div>
  );
}

function PortraitTeamTree({ team, canManage = false, onEditLeader, onEditMember, onDeleteMember, onAddMember }) {
  const levels = [
    { className: "level-two", members: team.members.slice(0, 3), variant: "aqua" },
    { className: "level-three", members: team.members.slice(3, 7), variant: "gold" },
    { className: "level-four", members: team.members.slice(7), variant: "violet" },
  ];

  return (
    <div className="team-portrait-tree" role="tree" aria-label="Team organization chart">
      {canManage && (
        <button className="portrait-add-node" type="button" onClick={onAddMember}>
          <FaPlus /> Add Node
        </button>
      )}
      <div className="portrait-chart">
        <div className="portrait-level portrait-level-root" role="group" aria-label="CEO">
          <div className="portrait-row">
            <TeamTreeNode person={team.leader} variant="coral" large canManage={canManage} onEdit={onEditLeader} />
          </div>
        </div>

        {levels.map((level, index) =>
          level.members.length > 0 ? (
            <div
              className={`portrait-level ${level.className}`}
              role="group"
              aria-label={`Organization level ${index + 2}`}
              key={level.className}
            >
              <div className="portrait-row">
                {level.members.map((member) => (
                  <TeamTreeNode
                    person={member}
                    variant={level.variant}
                    key={member.id}
                    canManage={canManage}
                    onEdit={onEditMember}
                    onDelete={onDeleteMember}
                  />
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

export default PortraitTeamTree;
