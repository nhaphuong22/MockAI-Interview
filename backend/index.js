import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
