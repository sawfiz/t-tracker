class CustomError extends Error {
  constructor(statusCode, message) {
    // Call the constructor of the Error class, which expects a message
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

    // This error is an operational error
    this.isOperational   = true;

    // Capture the stack trace from the base Error class
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = CustomError;
