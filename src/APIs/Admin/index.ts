import dotenv from 'dotenv';


import express from 'express';

import authRoutes from './routes/Admin.routes';

dotenv.config();  // Load environment variables

const app = express();

app.use(express.json());

app.use('/api/auth',authRoutes)

