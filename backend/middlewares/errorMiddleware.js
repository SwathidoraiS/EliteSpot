// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Optional: Log error only in development
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", err);
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;