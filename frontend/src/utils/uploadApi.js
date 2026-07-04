const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => resolve(reader.result || ""));
    reader.addEventListener("error", () => reject(new Error("Could not read the selected file.")));
    reader.readAsDataURL(file);
  });

export const uploadFileToCloudinary = async (file, options = {}) => {
  const dataUrl = await readFileAsDataUrl(file);
  const response = await fetch(`${apiBaseUrl}/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dataUrl,
      fileName: file.name,
      resourceType: options.resourceType || "auto",
      folder: options.folder || "assignopedia/uploads",
    }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Cloudinary upload failed.");
  }

  return data.upload;
};
