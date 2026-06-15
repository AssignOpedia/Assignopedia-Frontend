import { useState } from "react";

function useCareerApplication() {
  const [selectedPosition, setSelectedPosition] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [cvError, setCvError] = useState("");

  const handleCvChange = (event) => {
    const file = event.target.files?.[0];

    setCvError("");
    setCvFileName("");

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
  };

  return {
    selectedPosition,
    setSelectedPosition,
    cvFileName,
    cvError,
    handleCvChange,
  };
}

export default useCareerApplication;
