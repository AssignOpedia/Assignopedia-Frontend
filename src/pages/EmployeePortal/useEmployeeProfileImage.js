import { useEffect, useState } from "react";
import { currentUserEvent, getCurrentUser } from "../../utils/authStorage";

const legacyProfileImageKey = "employeeProfileImage";
const profileImageKeyPrefix = "employeeProfileImage:";
const profileImageEvent = "employee-profile-image-updated";
const profilesKey = "assignopediaPortalProfiles";
const profileSyncEvent = "assignopedia-profile-updated";

const getProfileImageKey = (user = getCurrentUser()) => {
  const accountId = user.email?.trim().toLowerCase() || "employee";

  return `${profileImageKeyPrefix}${user.role || "employee"}:${accountId}`;
};

const getProfileStorageKey = (user = getCurrentUser()) => {
  const role = user.role || "employee";
  const email = user.email?.trim().toLowerCase();

  return email ? `${role}:${email}` : role;
};

const readProfiles = () => {
  try {
    return JSON.parse(localStorage.getItem(profilesKey)) || {};
  } catch {
    return {};
  }
};

const saveProfileImageToSyncedProfile = (imageData, user = getCurrentUser()) => {
  const profiles = readProfiles();
  const profileKey = getProfileStorageKey(user);
  const nextProfiles = {
    ...profiles,
    [profileKey]: {
      ...(profiles[profileKey] || {}),
      imageDataUrl: imageData,
      updatedAt: new Date().toISOString(),
    },
  };

  localStorage.setItem(profilesKey, JSON.stringify(nextProfiles));
  window.dispatchEvent(new CustomEvent(profileSyncEvent, { detail: nextProfiles }));
};

const getSyncedProfileImage = (user = getCurrentUser()) => {
  const profiles = readProfiles();
  return profiles[getProfileStorageKey(user)]?.imageDataUrl || "";
};

const migrateLegacyProfileImage = (profileImageKey) => {
  const savedImage = localStorage.getItem(profileImageKey);
  const legacyImage = localStorage.getItem(legacyProfileImageKey);

  if (!savedImage && legacyImage) {
    localStorage.setItem(profileImageKey, legacyImage);
    localStorage.removeItem(legacyProfileImageKey);
    saveProfileImageToSyncedProfile(legacyImage);
    return legacyImage;
  }

  return savedImage || getSyncedProfileImage();
};

export const getEmployeeProfileImage = () => {
  const profileImageKey = getProfileImageKey();

  return migrateLegacyProfileImage(profileImageKey);
};

export const saveEmployeeProfileImage = (imageData) => {
  const profileImageKey = getProfileImageKey();

  localStorage.setItem(profileImageKey, imageData);
  saveProfileImageToSyncedProfile(imageData);
  window.dispatchEvent(
    new CustomEvent(profileImageEvent, {
      detail: { imageData, profileImageKey },
    })
  );
};

export const moveEmployeeProfileImage = (previousUser, nextUser) => {
  const previousKey = getProfileImageKey(previousUser);
  const nextKey = getProfileImageKey(nextUser);
  const savedImage = localStorage.getItem(previousKey);

  if (previousKey !== nextKey && savedImage && !localStorage.getItem(nextKey)) {
    localStorage.setItem(nextKey, savedImage);
    localStorage.removeItem(previousKey);
    saveProfileImageToSyncedProfile(savedImage, nextUser);
  }

  window.dispatchEvent(
    new CustomEvent(profileImageEvent, {
      detail: {
        imageData: localStorage.getItem(nextKey) || "",
        profileImageKey: nextKey,
      },
    })
  );
};

export const useEmployeeProfileImage = () => {
  const [profileImage, setProfileImage] = useState(getEmployeeProfileImage);

  useEffect(() => {
    const handleProfileImageUpdate = (event) => {
      if (!event.detail?.profileImageKey || event.detail.profileImageKey === getProfileImageKey()) {
        setProfileImage(event.detail?.imageData || getEmployeeProfileImage());
      }
    };

    const handleStorageUpdate = (event) => {
      if (event.key === getProfileImageKey()) {
        setProfileImage(event.newValue || "");
      }
    };

    const handleCurrentUserUpdate = () => {
      setProfileImage(getEmployeeProfileImage());
    };

    window.addEventListener(profileImageEvent, handleProfileImageUpdate);
    window.addEventListener("storage", handleStorageUpdate);
    window.addEventListener(currentUserEvent, handleCurrentUserUpdate);

    return () => {
      window.removeEventListener(profileImageEvent, handleProfileImageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener(currentUserEvent, handleCurrentUserUpdate);
    };
  }, []);

  return profileImage;
};
