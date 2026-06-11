import { createClient } from 'redis';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPassword = process.env.REDIS_PASSWORD || '';
const defaultTtl = parseInt(process.env.REDIS_TTL) || 1800; // Mặc định 30 phút

let redisClient = null;
let isRedisConnected = false;

if (process.env.NODE_ENV !== 'test') {
  let redisUrl = process.env.REDIS_URL || (redisPassword 
    ? `redis://:${redisPassword}@${redisHost}:${redisPort}`
    : `redis://${redisHost}:${redisPort}`);

  // Auto-convert to secure protocol (rediss://) if connecting to Upstash via separate env variables
  if (redisUrl.includes('upstash.io') && redisUrl.startsWith('redis://')) {
    redisUrl = redisUrl.replace('redis://', 'rediss://');
  }

  let logTarget = `${redisHost}:${redisPort}`;
  try {
    const parsedUrl = new URL(redisUrl);
    logTarget = parsedUrl.host;
  } catch (e) {
    // Keep fallback
  }

  const clientOptions = { url: redisUrl };

  // Enable TLS and bypass self-signed certificate validation for secure connections
  if (redisUrl.startsWith('rediss://') || redisUrl.includes('upstash.io')) {
    clientOptions.socket = {
      tls: true,
      rejectUnauthorized: false
    };
  }

  redisClient = createClient(clientOptions);

  redisClient.on('error', (err) => {
    console.warn('⚠️ [Redis Error]: Kết nối Redis thất bại hoặc bị ngắt quãng. Hệ thống tự động chuyển sang fallback dùng Database chính.', err.message);
    isRedisConnected = false;
  });

  redisClient.on('connect', () => {
    console.log('📡 [Redis]: Đang kết nối tới Redis...');
  });

  redisClient.on('ready', () => {
    console.log(`🚀 [Redis]: Kết nối thành công tới Redis server tại ${logTarget}`);
    isRedisConnected = true;
  });

  // Tự động kết nối và bắt lỗi để tránh crash ứng dụng khi Redis chưa chạy
  redisClient.connect().catch((err) => {
    console.warn('⚠️ [Redis Connection Failed]: Không thể kết nối tới Redis. Hệ thống chạy ở chế độ fallback trực tiếp Database.', err.message);
    isRedisConnected = false;
  });
}

/**
 * Lấy dữ liệu từ cache và tự động parse JSON
 */
export const getCache = async (key) => {
  if (!isRedisConnected || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`[Redis getCache Error] Key: ${key}:`, error.message);
    return null;
  }
};

/**
 * Lưu dữ liệu vào cache dưới dạng chuỗi JSON
 */
export const setCache = async (key, value, ttl = defaultTtl) => {
  if (!isRedisConnected || !redisClient) return false;
  try {
    const stringData = JSON.stringify(value);
    await redisClient.set(key, stringData, {
      EX: ttl
    });
    return true;
  } catch (error) {
    console.error(`[Redis setCache Error] Key: ${key}:`, error.message);
    return false;
  }
};

/**
 * Xóa một cache key cụ thể
 */
export const deleteCache = async (key) => {
  if (!isRedisConnected || !redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error(`[Redis deleteCache Error] Key: ${key}:`, error.message);
    return false;
  }
};

/**
 * Xóa cache theo mẫu (Scan keys an toàn trong production, tránh gây blocking Redis)
 */
export const deleteCachePattern = async (pattern) => {
  if (!isRedisConnected || !redisClient) return false;
  try {
    const keys = [];
    for await (const key of redisClient.scanIterator({ MATCH: pattern })) {
      keys.push(key);
    }
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🧹 [Redis Cache Cleaned]: Đã xóa ${keys.length} keys khớp với pattern "${pattern}"`);
    }
    return true;
  } catch (error) {
    console.error(`[Redis deleteCachePattern Error] Pattern: ${pattern}:`, error.message);
    return false;
  }
};

export default redisClient;
