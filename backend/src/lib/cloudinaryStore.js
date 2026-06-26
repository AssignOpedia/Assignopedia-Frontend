const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

const dataUrlPattern = /^data:([^;]+);base64,(.+)$/s;

const isDataUrl = (value) => typeof value === "string" && dataUrlPattern.test(value);

const getResourceType = (mimeType, fallback = "auto") => {
  if (mimeType?.startsWith("image/")) {
    return "image";
  }

  return fallback;
};

const uploadDataUrl = async (dataUrl, options = {}) => {
  const match = String(dataUrl || "").match(dataUrlPattern);

  if (!match) {
    return null;
  }

  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to backend/.env.");
  }

  const mimeType = match[1] || "application/octet-stream";
  const resourceType = options.resourceType || getResourceType(mimeType);
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: options.folder || "assignopedia/uploads",
    resource_type: resourceType,
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    filename_override: options.fileName,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    bytes: result.bytes,
    format: result.format,
    fileType: mimeType,
    fileName: options.fileName || result.original_filename || "",
  };
};

const decodeValue = (value = "") => {
  try {
    return decodeURIComponent(String(value));
  } catch (_error) {
    return String(value);
  }
};

const normalizeFileName = (value = "") =>
  decodeValue(value)
    .split("/")
    .pop()
    .split("?")[0]
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const getFileStem = (value = "") => normalizeFileName(value).replace(/\.[^.]+$/, "");

const findUploadByFileName = async (fileName, folders = ["assignopedia/wfh-requests"]) => {
  const targetFileName = normalizeFileName(fileName);
  const targetStem = getFileStem(fileName);
  const searchFolders = Array.isArray(folders) ? folders : [folders];

  if (!targetFileName || !isCloudinaryConfigured()) {
    return null;
  }

  const resourceTypes = ["raw", "image", "video"];

  for (const folder of searchFolders) {
    for (const resourceType of resourceTypes) {
      const response = await cloudinary.api.resources({
        type: "upload",
        prefix: folder,
        resource_type: resourceType,
        max_results: 500,
      }).catch(() => null);

      const resource = response?.resources?.find((item) => {
        const candidates = [
          normalizeFileName(item.public_id),
          normalizeFileName(item.original_filename),
          normalizeFileName(item.filename),
          normalizeFileName(item.secure_url),
        ].filter(Boolean);

        return candidates.some((candidate) => {
          const candidateStem = candidate.replace(/\.[^.]+$/, "");

          return (
            candidate === targetFileName ||
            candidateStem === targetStem ||
            candidate.includes(targetStem) ||
            targetStem.includes(candidateStem)
          );
        });
      });

      if (resource?.secure_url) {
        return {
          url: resource.secure_url,
          publicId: resource.public_id,
          resourceType: resource.resource_type,
          bytes: resource.bytes,
          format: resource.format,
        };
      }
    }
  }

  const searchableText = targetStem.replace(/["\\]/g, " ").trim();
  const searchResponse = searchableText
    ? await cloudinary.search
        .expression(`public_id:${searchableText}* OR filename:${searchableText}*`)
        .max_results(20)
        .execute()
        .catch(() => null)
    : null;
  const searchResource = searchResponse?.resources?.find((item) => {
    const candidates = [
      normalizeFileName(item.public_id),
      normalizeFileName(item.original_filename),
      normalizeFileName(item.filename),
      normalizeFileName(item.secure_url),
    ].filter(Boolean);

    return candidates.some((candidate) => {
      const candidateStem = candidate.replace(/\.[^.]+$/, "");

      return (
        candidate === targetFileName ||
        candidateStem === targetStem ||
        candidate.includes(targetStem) ||
        targetStem.includes(candidateStem)
      );
    });
  });

  if (searchResource?.secure_url) {
    return {
      url: searchResource.secure_url,
      publicId: searchResource.public_id,
      resourceType: searchResource.resource_type,
      bytes: searchResource.bytes,
      format: searchResource.format,
    };
  }

  return null;
};

const normalizeMediaPayload = async (payload, folder = "assignopedia/uploads") => {
  if (Array.isArray(payload)) {
    return Promise.all(payload.map((item) => normalizeMediaPayload(item, folder)));
  }

  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const next = {};

  for (const [key, value] of Object.entries(payload)) {
    next[key] = await normalizeMediaPayload(value, folder);
  }

  if (isDataUrl(next.imageDataUrl)) {
    const upload = await uploadDataUrl(next.imageDataUrl, {
      folder: `${folder}/images`,
      fileName: next.imageName,
      resourceType: "image",
    });

    next.imageDataUrl = upload.url;
    next.imageUrl = upload.url;
    next.imagePublicId = upload.publicId;
    next.imageResourceType = upload.resourceType;
  }

  if (isDataUrl(next.cvData)) {
    const upload = await uploadDataUrl(next.cvData, {
      folder: `${folder}/cv`,
      fileName: next.cvFileName,
      resourceType: "raw",
    });

    next.cvData = upload.url;
    next.cvUrl = upload.url;
    next.cvPublicId = upload.publicId;
    next.cvResourceType = upload.resourceType;
    next.cvFileType = upload.fileType;
  }

  if (isDataUrl(next.fileData)) {
    const upload = await uploadDataUrl(next.fileData, {
      folder: `${folder}/documents`,
      fileName: next.fileName,
      resourceType: "auto",
    });

    next.fileData = upload.url;
    next.fileUrl = upload.url;
    next.filePublicId = upload.publicId;
    next.fileResourceType = upload.resourceType;
    next.fileType = next.fileType || upload.fileType;
    next.fileSize = next.fileSize || upload.bytes;
  } else if (!next.fileUrl && /^https?:\/\//i.test(next.fileData || "")) {
    next.fileUrl = next.fileData;
  }

  if (isDataUrl(next.pdfData)) {
    const upload = await uploadDataUrl(next.pdfData, {
      folder: `${folder}/documents`,
      fileName: next.pdfFileName || next.fileName,
      resourceType: "auto",
    });

    next.pdfData = upload.url;
    next.pdfUrl = upload.url;
    next.pdfPublicId = upload.publicId;
    next.pdfResourceType = upload.resourceType;
    next.fileUrl = next.fileUrl || upload.url;
    next.fileName = next.fileName || next.pdfFileName || upload.fileName;
    next.fileType = next.fileType || upload.fileType;
    next.fileSize = next.fileSize || upload.bytes;
  } else if (!next.pdfUrl && /^https?:\/\//i.test(next.pdfData || "")) {
    next.pdfUrl = next.pdfData;
    next.fileUrl = next.fileUrl || next.pdfData;
  }

  return next;
};

module.exports = {
  findUploadByFileName,
  isCloudinaryConfigured,
  isDataUrl,
  normalizeMediaPayload,
  uploadDataUrl,
};
