import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { setupSwagger } from './config/swagger.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger Integration
setupSwagger(app);

// Main API Routes
app.use('/api', apiRoutes);

export default app;
