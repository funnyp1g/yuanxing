import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { HTMLConverter } from '../services/htmlConverter.js';
import { PROJECT_STORE } from '../services/store.js';

const router = Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.rp') {
      cb(null, true);
    } else {
      cb(new Error('Only .rp files are allowed'));
    }
  }
});

/**
 * POST /api/upload
 * Upload and convert a .rp file to HTML
 */
router.post('/', upload.single('rpFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const converter = new HTMLConverter();
    const result = await converter.convert(req.file.buffer, {
      filename: req.file.originalname
    });

    // Store project info
    PROJECT_STORE.set(result.projectId, {
      id: result.projectId,
      originalName: req.file.originalname,
      createdAt: new Date().toISOString(),
      pages: result.pages,
      pageCount: result.pageCount,
      url: result.url
    });

    res.json({
      success: true,
      project: {
        id: result.projectId,
        url: result.url,
        pageCount: result.pageCount,
        pages: result.pages,
        previewUrl: `/previews/${result.projectId}/index.html`
      }
    });
  } catch (error) {
    console.error('Upload/convert error:', error);
    res.status(500).json({ 
      error: 'Failed to convert file', 
      message: error.message 
    });
  }
});

export { router as uploadRouter };
