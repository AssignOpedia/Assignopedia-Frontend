import { useEffect, useState } from "react";

function useBlogUpload() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
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
      setImageDataUrl("");
      setUploadMessage({
        type: "error",
        text: "Invalid file type. Please upload PNG, JPG, or WEBP.",
      });
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      setImageDataUrl(reader.result || "");
    });
    reader.readAsDataURL(file);

    setUploadMessage({
      type: "success",
      text: "Image uploaded successfully \u2713",
    });
  };

  const resetBlogUpload = () => {
    setSelectedImage(null);
    setPreviewUrl("");
    setImageDataUrl("");
    setUploadMessage(null);
  };

  return {
    selectedImage,
    previewUrl,
    imageDataUrl,
    uploadMessage,
    handleCoverImageChange,
    resetBlogUpload,
  };
}

export default useBlogUpload;
