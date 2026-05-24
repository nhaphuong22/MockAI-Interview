import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/index.js';
import { setupSwagger } from './config/swagger.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Swagger Integration
setupSwagger(app);

// Main API Routes
app.use('/api', apiRoutes);

export default app;

