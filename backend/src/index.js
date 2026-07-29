import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadRouter } from './routes/upload.js';
import { previewRouter } from './routes/preview.js';
import { projectsRouter } from './routes/projects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Static files for previews
app.use('/previews', express.static(path.join(__dirname, '../output')));

// API Routes
app.use('/api/upload', uploadRouter);
app.use('/api/preview', previewRouter);
app.use('/api/projects', projectsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'yuanxing-backend' });
});

app.listen(PORT, () => {
  console.log(`🚀 Yuanxing server running on http://localhost:${PORT}`);
  console.log(`📁 Preview files served from: ${path.join(__dirname, '../output')}`);
});
