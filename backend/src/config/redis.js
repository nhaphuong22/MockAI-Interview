import { createClient } from 'redis';

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPassword = process.env.REDIS_PASSWORD || '';
const defaultTtl = parseInt(process.env.REDIS_TTL) || 1800; // Mặc định 30 phút

let redisClient = null;
let isRedisConnected = false;

if (process.env.NODE_ENV !== 'test') {
  let redisUrl = process.env.REDIS_URL;

  // If REDIS_URL points to 'redis', 'localhost' or '127.0.0.1' in production, but a specific REDIS_HOST is provided,
  // we prioritize the specific REDIS_HOST from the dashboard to prevent connecting to a non-existent or outdated instance.
  if (process.env.NODE_ENV === 'production' && redisUrl) {
    try {
      const u = new URL(redisUrl);
      if ((u.hostname === 'redis' || u.hostname === 'localhost' || u.hostname === '127.0.0.1') && 
          process.env.REDIS_HOST && process.env.REDIS_HOST !== 'redis' && process.env.REDIS_HOST !== 'localhost' && process.env.REDIS_HOST !== '127.0.0.1') {
        console.log(`📡 [Redis]: Detected outdated or default REDIS_URL (${u.hostname}). Switching to specific REDIS_HOST (${process.env.REDIS_HOST}) configuration.`);
        redisUrl = null;
      }
    } catch (e) {
      // Ignore parse errors and keep REDIS_URL
    }
  }

  if (!redisUrl) {
    redisUrl = redisPassword 
      ? `redis://:${redisPassword}@${redisHost}:${redisPort}`
      : `redis://${redisHost}:${redisPort}`;
  }

  // Auto-convert to secure protocol (rediss://) if connecting to Upstash via separate env variables
  if (redisUrl.includes('upstash.io') && redisUrl.startsWith('redis://')) {
    redisUrl = redisUrl.replace('redis://', 'rediss://');
  }

  let logTarget = `${redisHost}:${redisPort}`;
  const clientOptions = {};

  try {
    const parsedUrl = new URL(redisUrl);
    logTarget = parsedUrl.host;

    // Extract database index if present in pathname (e.g. /0)
    let dbIndex = null;
    if (parsedUrl.pathname && parsedUrl.pathname !== '/') {
      const match = parsedUrl.pathname.match(/^\/(\d+)$/);
      if (match) {
        dbIndex = parseInt(match[1], 10);
      }
      // Remove invalid pathname to avoid node-redis v6 crash
      parsedUrl.pathname = '';
    }

    clientOptions.url = parsedUrl.toString();
    if (dbIndex !== null) {
      clientOptions.database = dbIndex;
    }
  } catch (e) {
    console.warn('⚠️ [Redis URL Parse Warning]: Failed to parse REDIS_URL, using raw value:', e.message);
    clientOptions.url = redisUrl;
  }

  // Enable TLS and bypass self-signed certificate validation for secure connections
  const socketOpts = {
    connectTimeout: 2000,
    reconnectStrategy: (retries) => {
      if (retries > 2) return false; // Stop retrying after 2 attempts
      return 500;
    }
  };

  if (clientOptions.url.startsWith('rediss://') || clientOptions.url.includes('upstash.io')) {
    socketOpts.tls = true;
    socketOpts.rejectUnauthorized = false;
  }

  clientOptions.socket = socketOpts;

  try {
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
  } catch (error) {
    console.error('⚠️ [Redis Initialization Failed]: Không thể khởi tạo Redis client (lỗi URL hoặc cấu hình). Hệ thống chạy ở chế độ fallback trực tiếp Database.', error.message);
    redisClient = null;
    isRedisConnected = false;
  }
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
    for await (const keyOrKeys of redisClient.scanIterator({ MATCH: pattern })) {
      if (Array.isArray(keyOrKeys)) {
        keys.push(...keyOrKeys);
      } else {
        keys.push(keyOrKeys);
      }
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
