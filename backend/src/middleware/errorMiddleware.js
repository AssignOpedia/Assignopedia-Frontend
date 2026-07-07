const notFound = (req, res) => {
  res.status(404).json({ message: "API route not found" });
};

const errorHandler = (error, req, res, _next) => {
  console.error(error);

  if (error.type === "entity.too.large") {
    res.status(413).json({
      message: "Upload is too large for the current server request limit. Increase REQUEST_BODY_LIMIT in backend/.env or Render environment variables.",
    });
    return;
  }

  res.status(error.status || 500).json({
    message: error.message || "Something went wrong",
  });
};

module.exports = { errorHandler, notFound };
