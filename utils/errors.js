const logger = require('./logger');

const asyncWrapper = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    logger.error(`Async error: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled exception: ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    time: Date.now()
  });
};

module.exports = { asyncWrapper, errorHandler };
