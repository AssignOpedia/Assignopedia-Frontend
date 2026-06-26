const notFound = (req, res) => {
  res.status(404).json({ message: "API route not found" });
};

const errorHandler = (error, req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || "Something went wrong",
  });
};

module.exports = { errorHandler, notFound };
