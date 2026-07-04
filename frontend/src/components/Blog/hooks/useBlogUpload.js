import { useEffect, useState } from "react";
import { uploadFileToCloudinary } from "../../../utils/uploadApi";

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

  const handleCoverImageChange = async (event) => {
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
    setUploadMessage({
      type: "success",
      text: "Uploading image to Cloudinary...",
    });

    try {
      const upload = await uploadFileToCloudinary(file, {
        folder: "assignopedia/blog-posts",
        resourceType: "image",
      });

      setImageDataUrl(upload.url);
      setUploadMessage({
        type: "success",
        text: "Image uploaded to Cloudinary \u2713",
      });
    } catch (error) {
      setSelectedImage(null);
      setPreviewUrl("");
      setImageDataUrl("");
      setUploadMessage({
        type: "error",
        text: error.message,
      });
      event.target.value = "";
    }
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
