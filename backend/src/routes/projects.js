import { Router } from 'express';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { PROJECT_STORE } from '../services/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__dirname));

const router = Router();
const OUTPUT_DIR = path.join(__dirname, '../../output');

/**
 * GET /api/projects
 * List all projects
 */
router.get('/', (req, res) => {
  const projects = PROJECT_STORE.getAll();
  res.json({
    success: true,
    projects: projects.map(p => ({
      id: p.id,
      name: p.originalName,
      createdAt: p.createdAt,
      pageCount: p.pageCount,
      url: p.url
    }))
  });
});

/**
 * GET /api/projects/:projectId
 * Get project details
 */
router.get('/:projectId', (req, res) => {
  const { projectId } = req.params;
  const project = PROJECT_STORE.get(projectId);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  res.json({ success: true, project });
});

/**
 * DELETE /api/projects/:projectId
 * Delete a project
 */
router.delete('/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const project = PROJECT_STORE.get(projectId);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  // Remove files
  const projectDir = path.join(OUTPUT_DIR, projectId);
  if (await fs.pathExists(projectDir)) {
    await fs.remove(projectDir);
  }
  
  // Remove from store
  PROJECT_STORE.delete(projectId);
  
  res.json({ success: true, message: 'Project deleted' });
});

export { router as projectsRouter };
