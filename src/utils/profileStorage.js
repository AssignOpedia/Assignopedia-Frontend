import { getCurrentUser, updateCurrentUserProfile } from "./authStorage";
import { createApiResourceStore } from "./apiResourceStore";

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

const defaultProfiles = {
  "employee:employee@assignopedia.com": defaults.employee,
  "hr:hr@assignopedia.com": defaults.hr,
  "admin:raj.admin@assignopedia.com": defaults.admin,
};

const profileStore = createApiResourceStore({
  resource: "profiles",
  event: profileEvent,
  fallback: defaultProfiles,
});

const readProfiles = () => profileStore.get();

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
  const nextProfiles = { ...profiles };

  if (oldProfileKey !== nextProfileKey) {
    delete nextProfiles[oldProfileKey];
  }

  nextProfiles[nextProfileKey] = nextProfile;
  profileStore.save(nextProfiles).catch(() => {});

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
