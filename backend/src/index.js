import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes will be mounted here
// For now, let's create a health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mocking some routes for now or importing them
// In a real scenario, we'd systematically convert each route.js

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
