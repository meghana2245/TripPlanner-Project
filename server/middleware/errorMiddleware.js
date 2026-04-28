const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
  });
};

module.exports = { notFound, errorHandler };
