import { v2 as cloudinary } from 'cloudinary';

// Tự động sử dụng CLOUDINARY_URL cấu hình trong .env
cloudinary.config();

export default cloudinary;
