import { Router } from 'express';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { PROJECT_STORE } from '../services/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename));

const router = Router();

/**
 * GET /api/preview/:projectId
 * Get preview info for a project
 */
router.get('/:projectId', (req, res) => {
  const { projectId } = req.params;
  const project = PROJECT_STORE.get(projectId);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  res.json({
    success: true,
    project
  });
});

/**
 * GET /api/preview/:projectId/share
 * Get shareable link info
 */
router.get('/:projectId/share', (req, res) => {
  const { projectId } = req.params;
  const project = PROJECT_STORE.get(projectId);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  res.json({
    success: true,
    shareUrl: `${baseUrl}/previews/${projectId}/index.html`,
    embedUrl: `${baseUrl}/previews/${projectId}/index.html`,
    projectId
  });
});

export { router as previewRouter };
