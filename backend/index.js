import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'MockAI-Interview Backend is running!',
      timestamp: new Date().toISOString()
    },
    error: null
  });
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
