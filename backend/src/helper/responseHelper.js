/**
 * Standard API Response Helper
 */
export const sendResponse = (res, statusCode, data = null, error = null) => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    data,
    error
  });
};

export const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: message
  });
};
