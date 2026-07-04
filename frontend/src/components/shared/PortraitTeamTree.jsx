import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { getCurrentUser } from "../../utils/authStorage";

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

function TeamTreeBranch({ person, children = [], variant, canManage, onEdit, onDelete }) {
  if (!person) {
    return null;
  }

  return (
    <li>
      <TeamTreeNode
        person={person}
        variant={variant}
        canManage={canManage}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      {children.length > 0 && (
        <ul>
          {children.map((child, index) => (
            <TeamTreeBranch
              person={child.person}
              children={child.children}
              variant={child.variant}
              canManage={canManage}
              onEdit={onEdit}
              onDelete={onDelete}
              key={child.person?.id || `empty-branch-${index}`}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function PortraitTeamTree({ team, canManage = false, onEditLeader, onEditMember, onDeleteMember, onAddMember }) {
  const isHrUser = String(getCurrentUser().role || "").toLowerCase() === "hr";
  const hasManagementPermission = canManage && isHrUser;
  const members = new Map(team.members.map((member) => [member.id, member]));
  const hierarchyIds = new Set([
    "hr-management",
    "operation-management",
    "team-lead",
    "hr-recruiter",
    "hr-executive",
    "bdm-1",
    "bdm-2",
    "dm",
    "technical-team",
    "non-technical-team",
  ]);
  const customMembers = team.members.filter((member) => !hierarchyIds.has(member.id));
  const branches = [
    {
      person: members.get("hr-management"),
      variant: "aqua",
      children: [
        { person: members.get("hr-recruiter"), variant: "gold", children: [] },
        { person: members.get("hr-executive"), variant: "gold", children: [] },
      ],
    },
    {
      person: members.get("operation-management"),
      variant: "aqua",
      children: [
        {
          person: members.get("bdm-1"),
          variant: "gold",
          children: [
            { person: members.get("dm"), variant: "violet", children: [] },
          ],
        },
        { person: members.get("bdm-2"), variant: "gold", children: [] },
      ],
    },
    {
      person: members.get("team-lead"),
      variant: "aqua",
      children: [
        { person: members.get("technical-team"), variant: "violet", children: [] },
        { person: members.get("non-technical-team"), variant: "violet", children: [] },
        ...customMembers.map((member) => ({ person: member, variant: "violet", children: [] })),
      ],
    },
  ];

  return (
    <div className="team-portrait-tree" role="tree" aria-label="Team organization chart">
      {hasManagementPermission && (
        <button className="portrait-add-node" type="button" onClick={onAddMember}>
          <FaPlus /> Add Node
        </button>
      )}
      <div className="portrait-chart">
        <ul className="portrait-org-tree">
          <li>
            <TeamTreeNode person={team.leader} variant="coral" large canManage={hasManagementPermission} onEdit={onEditLeader} />
            <ul>
              {branches.map((branch) => (
                <TeamTreeBranch
                  person={branch.person}
                  children={branch.children}
                  variant={branch.variant}
                  canManage={hasManagementPermission}
                  onEdit={onEditMember}
                  onDelete={onDeleteMember}
                  key={branch.person?.id}
                />
              ))}
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default PortraitTeamTree;
