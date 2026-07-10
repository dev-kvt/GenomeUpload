import { Router } from 'express';
import { uploadGenome } from '../controllers/genomeController.js';
import { analyzeGenome } from '../controllers/analyzeController.js';

const router = Router();

router.post('/upload-genome', uploadGenome);
router.post('/analyze', analyzeGenome);

export default router;
