# API Documentation

Thư mục này chứa tài liệu hướng dẫn sử dụng các API endpoints của MockAI-Interview.

## 📚 Available Documentation

- [Jobs API Examples](./jobs-api-examples.md) - Hướng dẫn sử dụng API quản lý tin tuyển dụng

## 🔗 Swagger UI

Để xem đầy đủ API documentation với Swagger UI, truy cập:
```
http://localhost:5000/api-docs
```

## 🧪 Testing APIs

### Sử dụng Postman
1. Import collection từ file examples
2. Tạo environment với biến `BASE_URL` và `TOKEN`
3. Test các endpoints

### Sử dụng cURL
Xem các ví dụ cURL trong từng file documentation.

### Sử dụng Swagger UI
1. Khởi động server: `npm run dev`
2. Truy cập: http://localhost:5000/api-docs
3. Click "Authorize" và nhập Bearer token
4. Test trực tiếp trên UI

## 📝 Quy tắc viết API Documentation

Khi thêm API mới, hãy tạo file documentation với format:
- Mô tả endpoint
- Request examples (JSON)
- Response examples
- Error cases
- cURL examples
