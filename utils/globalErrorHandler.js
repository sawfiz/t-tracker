const CustomError = require('./CustomError');

function globalErrorHandler(err, req, res, next) {
  console.log("🚀 ~ file: globalErrorHandler.js:4 ~ globalErrorHandler ~ err:", err)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err instanceof CustomError) {
    res.status(err.statusCode || 500).json({ status: err.statusCode, error: err.message });
  } else {
    const statusCode = err.status || 500;
    res.status(statusCode).json({ status: statusCode, error: err.message });
  }
}

module.exports = globalErrorHandler;