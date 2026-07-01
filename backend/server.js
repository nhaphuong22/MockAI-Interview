import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

// Fail-fast environment check
const requiredEnv = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GROQ_API_KEY',
  'ELEVENLABS_API_KEY'
];

const missingEnv = requiredEnv.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error('\n================================================================');
  console.error('[FAIL-FAST] CRITICAL ERROR: Missing required environment variables:');
  missingEnv.forEach(key => console.error(` - ${key}`));
  console.error('The server cannot start without these configurations.');
  console.error('================================================================\n');
  process.exit(1);
}

import app from './src/app.js';

import { setupSocket } from './src/socket.js';
import { initDailyScheduler } from './src/services/dailySchedulerService.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Khởi tạo Socket.io
setupSocket(server);

import { cleanupExpiredInvitations } from './src/controllers/companyController.js';
// Chạy dọn dẹp lời mời hết hạn 30 ngày định kỳ mỗi 24 giờ
setInterval(cleanupExpiredInvitations, 24 * 60 * 60 * 1000);
// Chạy lần đầu sau khi khởi động server 10 giây
setTimeout(cleanupExpiredInvitations, 10000);

// Khởi tạo Scheduler sinh câu hỏi hàng ngày
initDailyScheduler();

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Trigger nodemon restart after order info fix
