const CustomError = require('./CustomError');

function globalErrorHandler(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err instanceof CustomError) {
    res.status(err.statusCode || 500).json({ status: err.statusCode, error: err.message });
  } else {
    res.status(err.status || 500).json({ status: err.status, error: err.message });
  }
}

module.exports = globalErrorHandler;