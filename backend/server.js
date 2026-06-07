<<<<<<< HEAD
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

=======
import 'dotenv/config'; // Load env variables immediately before any other module is resolved
import http from 'http';
>>>>>>> 6c76fc9 (add apply job logic)
import app from './src/app.js';
import { setupSocket } from './src/socket.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Khởi tạo Socket.io
setupSocket(server);

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