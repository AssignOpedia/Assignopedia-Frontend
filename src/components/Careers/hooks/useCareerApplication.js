import { useState } from "react";
import { submitCareerApplication } from "../../../utils/cvStorage";

function useCareerApplication() {
  const [selectedPosition, setSelectedPosition] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [cvError, setCvError] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCvChange = (event) => {
    const file = event.target.files?.[0];

    setCvError("");
    setCvFileName("");
    setCvFile(null);

    if (!file) {
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setCvError("Please upload a PDF file only.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setCvError("File size must be less than 10 MB.");
      event.target.value = "";
      return;
    }

    setCvFileName(file.name);
    setCvFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setCvError("");

    const formData = new FormData(event.target);
    const fullName = formData.get("fullName")?.trim();
    const email = formData.get("email")?.trim();
    const phone = formData.get("phone")?.trim();
    const position = formData.get("position")?.trim();
    const about = formData.get("about")?.trim();

    if (!fullName || !email || !phone || !position || !cvFile || !about) {
      setCvError("Please fill all fields and upload CV.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onload = () => {
        const cvData = reader.result;
        submitCareerApplication({
          fullName,
          email,
          phone,
          position,
          about,
          cvFileName: cvFile.name,
          cvData,
          role: position,
          status: "New",
        });

        setSuccessMessage("Application submitted successfully! HR will review your CV soon.");
        event.target.reset();
        setSelectedPosition("");
        setCvFileName("");
        setCvFile(null);
        setIsSubmitting(false);

        setTimeout(() => setSuccessMessage(""), 3000);
      };
      reader.readAsDataURL(cvFile);
    } catch {
      setCvError("Failed to submit application. Please try again.");
      setIsSubmitting(false);
    }
  };

  return {
    selectedPosition,
    setSelectedPosition,
    cvFileName,
    cvError,
    handleCvChange,
    handleSubmit,
    successMessage,
    isSubmitting,
  };
}

export default useCareerApplication;
