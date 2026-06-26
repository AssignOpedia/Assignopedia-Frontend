const officeExtensions = new Set(["doc", "docx", "ppt", "pptx", "xls", "xlsx"]);

const getExtension = (nameOrUrl = "") => {
  const cleanValue = String(nameOrUrl).split("?")[0].split("#")[0];
  const fileName = cleanValue.split("/").pop() || "";
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "";

  return extension.toLowerCase();
};

const isOfficeDocument = ({ name = "", url = "" }) =>
  officeExtensions.has(getExtension(name)) || officeExtensions.has(getExtension(url));

const isPreviewableInline = ({ fileType = "", name = "", url = "" }) => {
  const extension = getExtension(name) || getExtension(url);

  return (
    fileType.startsWith("image/") ||
    fileType === "application/pdf" ||
    ["pdf", "png", "jpg", "jpeg", "webp", "gif"].includes(extension)
  );
};

export const getDocumentPreviewUrl = ({ url = "", name = "", fileType = "" }) => {
  if (!url) {
    return "";
  }

  if (isOfficeDocument({ name, url })) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
  }

  if (isPreviewableInline({ fileType, name, url })) {
    return url;
  }

  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
};

export const openDocumentPreview = ({ url = "", name = "", fileType = "", previewWindow = null }) => {
  const previewUrl = getDocumentPreviewUrl({ url, name, fileType });

  if (!previewUrl) {
    throw new Error("This file cannot be previewed because it does not have a public URL.");
  }

  if (previewWindow) {
    previewWindow.location.href = previewUrl;
    previewWindow.document.title = name || "Document preview";
    return;
  }

  window.open(previewUrl, "_blank", "noopener,noreferrer");
};
