export const teamStorageKey = "assignopediaEmployeeTeam";
export const teamEvent = "assignopedia-team-updated";

export const defaultTeam = {
  leader: {
    id: "leader",
    name: "Raj Da",
    role: "CEO",
    imageDataUrl: "",
    imageName: "",
  },
  members: [
    { id: "hr-management", name: "HR Management", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "hr-name-1", name: "HR Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "hr-name-2", name: "HR Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "operation-management", name: "Operation Management", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "bdm-name", name: "BDM Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "digital-marketing", name: "Digital Marketing Executive Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "bdm-name-2", name: "BDM Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "team-lead", name: "Team Lead", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "team-lead-name", name: "Team Lead name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "writer-1", name: "Technical Content Writer Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "writer-2", name: "Technical Content Writer Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "writer-3", name: "Technical Content Writer Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "writer-4", name: "Technical Content Writer Name", role: "Team Member", imageDataUrl: "", imageName: "" },
  ],
};

export const createTeamMember = () => ({
  id: `member-${Date.now()}`,
  name: "New Team Member",
  role: "Team Member",
  imageDataUrl: "",
  imageName: "",
});

const normalizeMember = (member, index) => ({
  id: member.id || `member-${Date.now()}-${index}`,
  name: member.name || "",
  role: member.role || "Team Member",
  imageDataUrl: member.imageDataUrl || "",
  imageName: member.imageName || "",
});

export const normalizeTeam = (team) => ({
  leader: {
    ...defaultTeam.leader,
    ...(team?.leader || {}),
    id: "leader",
    imageDataUrl: team?.leader?.imageDataUrl || "",
    imageName: team?.leader?.imageName || "",
  },
  members: Array.isArray(team?.members)
    ? team.members.map(normalizeMember)
    : defaultTeam.members,
});

export const getTeam = () => {
  try {
    const savedTeam = JSON.parse(localStorage.getItem(teamStorageKey));

    if (savedTeam?.leader && Array.isArray(savedTeam.members)) {
      return normalizeTeam(savedTeam);
    }
  } catch {
    localStorage.removeItem(teamStorageKey);
  }

  return defaultTeam;
};

export const saveTeam = (team) => {
  const nextTeam = normalizeTeam(team);

  localStorage.setItem(teamStorageKey, JSON.stringify(nextTeam));
  window.dispatchEvent(new CustomEvent(teamEvent, { detail: nextTeam }));

  return nextTeam;
};
