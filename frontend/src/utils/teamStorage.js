import { createApiResourceStore } from "./apiResourceStore";

export const teamEvent = "assignopedia-team-updated";

export const defaultTeam = {
  schemaVersion: 2,
  leader: {
    id: "leader",
    name: "Raj Da",
    role: "CEO",
    department: "Management",
    initials: "RD",
    imageDataUrl: "",
    imageName: "",
  },
  members: [
    { id: "hr-management", name: "H.R Management", role: "Human Resources", department: "H.R", initials: "HR", imageDataUrl: "", imageName: "" },
    { id: "operation-management", name: "Operation Management", role: "Operations", department: "Operations", initials: "OM", imageDataUrl: "", imageName: "" },
    { id: "team-lead", name: "TL", role: "Team Lead", department: "Delivery", initials: "TL", imageDataUrl: "", imageName: "" },
    { id: "hr-recruiter", name: "H.R Recruiter", role: "Recruitment", department: "H.R", initials: "HR", imageDataUrl: "", imageName: "" },
    { id: "hr-executive", name: "H.R Executive", role: "HR Operations", department: "H.R", initials: "HE", imageDataUrl: "", imageName: "" },
    { id: "bdm-1", name: "B.D.M 1", role: "Business Development", department: "Operations", initials: "B1", imageDataUrl: "", imageName: "" },
    { id: "bdm-2", name: "B.D.M 2", role: "Business Development", department: "Operations", initials: "B2", imageDataUrl: "", imageName: "" },
    { id: "dm", name: "D.M", role: "Digital Marketing", department: "Operations", initials: "DM", imageDataUrl: "", imageName: "" },
    { id: "technical-team", name: "Technical Team", role: "Technical Delivery", department: "Delivery", initials: "TT", imageDataUrl: "", imageName: "" },
    { id: "non-technical-team", name: "Non-Technical Team", role: "Non-Technical Delivery", department: "Delivery", initials: "NT", imageDataUrl: "", imageName: "" },
  ],
};

export const createTeamMember = () => ({
  id: `member-${Date.now()}`,
  name: "New Team Member",
  role: "Team Member",
  department: "",
  initials: "",
  imageDataUrl: "",
  imageName: "",
});

const normalizeMember = (member, index) => ({
  id: member.id || `member-${Date.now()}-${index}`,
  name: member.name || "",
  role: member.role || "Team Member",
  department: member.department || "",
  initials: member.initials || "",
  imageDataUrl: member.imageDataUrl || member.imageUrl || "",
  imageUrl: member.imageUrl || member.imageDataUrl || "",
  imageName: member.imageName || "",
  imagePublicId: member.imagePublicId || "",
});

export const normalizeTeam = (team) => ({
  schemaVersion: defaultTeam.schemaVersion,
  leader: {
    ...defaultTeam.leader,
    ...(team?.leader || {}),
    id: "leader",
    imageDataUrl: team?.leader?.imageDataUrl || team?.leader?.imageUrl || "",
    imageUrl: team?.leader?.imageUrl || team?.leader?.imageDataUrl || "",
    imageName: team?.leader?.imageName || "",
    imagePublicId: team?.leader?.imagePublicId || "",
  },
  members: Array.isArray(team?.members) ? team.members.map(normalizeMember) : defaultTeam.members,
});

const teamStore = createApiResourceStore({
  resource: "team",
  event: teamEvent,
  fallback: defaultTeam,
});

export const getTeam = () => normalizeTeam(teamStore.get());

export const saveTeam = (team) => {
  const nextTeam = normalizeTeam(team);

  teamStore.save(nextTeam).catch(() => {});
  return nextTeam;
};

export const teamStorageKey = "assignopediaEmployeeTeam";
