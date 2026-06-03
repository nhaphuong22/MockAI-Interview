export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy tài nguyên yêu cầu') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Dữ liệu không hợp lệ') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Chưa xác thực quyền truy cập') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Không có quyền truy cập thao tác này') {
    super(message, 403);
  }
}
