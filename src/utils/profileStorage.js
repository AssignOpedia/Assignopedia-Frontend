import { getCurrentUser, updateCurrentUserProfile } from "./authStorage";

const profileKey = "assignopediaPortalProfiles";
const profileEvent = "assignopedia-profile-updated";

const defaults = {
  employee: {
    name: "Employee",
    email: "employee@assignopedia.com",
    title: "Technical Content Writer",
    employeeId: "EMP-240128",
    jobCode: "FE-12",
    phone: "+91 98765 43210",
    location: "Kolkata, India",
    summary:
      "Experienced technical content writer supporting Assignopedia with structured project writeups, user-focused documentation, and quality-first delivery.",
    availability: "Available for assigned work",
  },
  hr: {
    name: "HR Admin",
    email: "hr@assignopedia.com",
    title: "Human Resources",
    phone: "+91 98765 43211",
    location: "Kolkata, India",
    department: "HR Operations",
  },
  admin: {
    name: "Raj Da",
    email: "raj.admin@assignopedia.com",
    title: "Administrator",
    phone: "+91 98765 43212",
    location: "Kolkata, India",
    department: "Administration",
  },
};

const readProfiles = () => {
  try {
    return JSON.parse(localStorage.getItem(profileKey)) || {};
  } catch {
    return {};
  }
};

const saveProfiles = (profiles) => {
  localStorage.setItem(profileKey, JSON.stringify(profiles));
  window.dispatchEvent(new CustomEvent(profileEvent, { detail: profiles }));
};

const getProfileStorageKey = (role, email) =>
  email ? `${role}:${email.trim().toLowerCase()}` : role;

export const getPortalProfile = (role) => {
  const currentUser = getCurrentUser();
  const profiles = readProfiles();
  const isCurrentRole = currentUser.role === role;
  const savedProfile = isCurrentRole
    ? profiles[getProfileStorageKey(role, currentUser.email)] || {}
    : profiles[role] || {};
  const baseProfile = {
    ...defaults[role],
    name:
      isCurrentRole && currentUser.name
        ? currentUser.name
        : defaults[role].name,
    email:
      isCurrentRole && currentUser.email
        ? currentUser.email
        : defaults[role].email,
  };

  return { ...baseProfile, ...savedProfile };
};

export const savePortalProfile = (role, profile) => {
  const profiles = readProfiles();
  const currentUser = getCurrentUser();
  const isCurrentRole = currentUser.role === role;
  const oldProfileKey = isCurrentRole
    ? getProfileStorageKey(role, currentUser.email)
    : role;
  const nextProfileKey = isCurrentRole
    ? getProfileStorageKey(role, profile.email)
    : role;
  const nextProfile = {
    ...getPortalProfile(role),
    ...profile,
  };

  if (oldProfileKey !== nextProfileKey) {
    delete profiles[oldProfileKey];
  }

  profiles[nextProfileKey] = nextProfile;
  saveProfiles(profiles);

  if (isCurrentRole) {
    updateCurrentUserProfile({
      name: nextProfile.name,
      email: nextProfile.email,
    });
  }

  return nextProfile;
};

export const getInitialsFromProfile = (profile) =>
  profile.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AP";

export { profileEvent };
