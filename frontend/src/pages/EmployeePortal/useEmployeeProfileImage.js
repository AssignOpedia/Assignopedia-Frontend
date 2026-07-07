import { useEffect, useState } from "react";
import { currentUserEvent, getCurrentUser } from "../../utils/authStorage";
import { getPortalProfile, profileEvent, savePortalProfile } from "../../utils/profileStorage";

const profileImageEvent = "employee-profile-image-updated";

export const getEmployeeProfileImage = () => {
  const profile = getPortalProfile("employee");

  return profile.imageDataUrl || profile.imageUrl || "";
};

export const saveEmployeeProfileImage = (image) => {
  const user = getCurrentUser();
  const profile = getPortalProfile("employee");
  const imageUrl = typeof image === "string" ? image : image?.url || "";
  const nextProfile = {
    ...profile,
    email: user.email || profile.email,
    imageDataUrl: imageUrl,
    imageUrl,
    imagePublicId: typeof image === "object" ? image.publicId || "" : profile.imagePublicId || "",
    imageResourceType: typeof image === "object" ? image.resourceType || "image" : profile.imageResourceType || "image",
    imageName: typeof image === "object" ? image.fileName || image.fileName || "" : profile.imageName || "",
  };

  savePortalProfile("employee", nextProfile);
  window.dispatchEvent(new CustomEvent(profileImageEvent, { detail: { imageData: imageUrl } }));
};

export const moveEmployeeProfileImage = () => {
  window.dispatchEvent(
    new CustomEvent(profileImageEvent, {
      detail: { imageData: getEmployeeProfileImage() },
    })
  );
};

export const useEmployeeProfileImage = () => {
  const [profileImage, setProfileImage] = useState(getEmployeeProfileImage);

  useEffect(() => {
    const refreshProfileImage = (event) => {
      setProfileImage(event.detail?.imageData || getEmployeeProfileImage());
    };

    const handleCurrentUserUpdate = () => {
      setProfileImage(getEmployeeProfileImage());
    };

    window.addEventListener(profileImageEvent, refreshProfileImage);
    window.addEventListener(profileEvent, handleCurrentUserUpdate);
    window.addEventListener(currentUserEvent, handleCurrentUserUpdate);

    return () => {
      window.removeEventListener(profileImageEvent, refreshProfileImage);
      window.removeEventListener(profileEvent, handleCurrentUserUpdate);
      window.removeEventListener(currentUserEvent, handleCurrentUserUpdate);
    };
  }, []);

  return profileImage;
};
