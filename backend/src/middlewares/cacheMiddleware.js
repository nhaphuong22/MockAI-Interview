import { getCache, setCache } from '../config/redis.js';

/**
 * Middleware tự động cache kết quả của các API GET
 * @param {string} keyPrefix - Prefix của cache key (ví dụ: 'jobs:list')
 * @param {number} ttl - Thời gian sống của cache tính bằng giây
 */
export const cacheMiddleware = (keyPrefix, ttl = 1800) => {
  return async (req, res, next) => {
    // Chỉ cache các request GET
    if (req.method !== 'GET') {
      return next();
    }

    // Tạo cache key độc nhất dựa trên URL, query string và ID người dùng (nếu có để bảo mật dữ liệu phân quyền)
    const userId = req.user ? req.user.id : 'guest';
    const queryStr = JSON.stringify(req.query);
    const cacheKey = `${keyPrefix}:${userId}:${req.originalUrl || req.url}:${queryStr}`;

    try {
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        // console.log(`🎯 [Redis Cache Hit]: ${cacheKey}`);
        return res.status(200).json(cachedData);
      }

      // console.log(`⚡ [Redis Cache Miss]: ${cacheKey}. Fetching from database...`);

      // Sử dụng kỹ thuật Monkey Patching ghi đè tạm thời res.json để tự động lưu cache khi controller trả về kết quả
      const originalJson = res.json;
      res.json = function (body) {
        res.json = originalJson; // Khôi phục lại hàm gốc ngay lập tức
        
        // Chỉ lưu cache khi HTTP status code là thành công (200) và body hợp lệ
        if (res.statusCode === 200 && body) {
          // Lưu vào cache chạy ngầm để không cản trở tốc độ phản hồi của API
          setCache(cacheKey, body, ttl).catch(err => {
            console.error('[Redis Cache Middleware Set Error]:', err.message);
          });
        }
        
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('[Redis Cache Middleware Error]:', error.message);
      next();
    }
  };
};
