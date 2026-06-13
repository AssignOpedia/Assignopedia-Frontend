import { useEffect, useState } from "react";

const profileImageKey = "employeeProfileImage";
const profileImageEvent = "employee-profile-image-updated";

export const getEmployeeProfileImage = () =>
  localStorage.getItem(profileImageKey) || "";

export const saveEmployeeProfileImage = (imageData) => {
  localStorage.setItem(profileImageKey, imageData);
  window.dispatchEvent(new CustomEvent(profileImageEvent, { detail: imageData }));
};

export const useEmployeeProfileImage = () => {
  const [profileImage, setProfileImage] = useState(getEmployeeProfileImage);

  useEffect(() => {
    const handleProfileImageUpdate = (event) => {
      setProfileImage(event.detail || getEmployeeProfileImage());
    };

    const handleStorageUpdate = (event) => {
      if (event.key === profileImageKey) {
        setProfileImage(event.newValue || "");
      }
    };

    window.addEventListener(profileImageEvent, handleProfileImageUpdate);
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      window.removeEventListener(profileImageEvent, handleProfileImageUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  return profileImage;
};
