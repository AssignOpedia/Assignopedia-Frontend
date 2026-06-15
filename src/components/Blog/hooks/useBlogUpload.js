import { useEffect, useState } from "react";

function useBlogUpload() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadMessage, setUploadMessage] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleCoverImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    const allowedExtension = /\.(png|jpe?g|webp)$/i.test(file.name);

    if (!allowedTypes.includes(file.type) || !allowedExtension) {
      setSelectedImage(null);
      setPreviewUrl("");
      setUploadMessage({
        type: "error",
        text: "Invalid file type. Please upload PNG, JPG, or WEBP.",
      });
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadMessage({
      type: "success",
      text: "Image uploaded successfully \u2713",
    });
  };

  return {
    selectedImage,
    previewUrl,
    uploadMessage,
    handleCoverImageChange,
  };
}

export default useBlogUpload;
