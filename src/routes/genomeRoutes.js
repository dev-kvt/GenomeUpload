import { Router } from 'express';
import { uploadGenome } from '../controllers/genomeController.js';

const router = Router();

router.post('/upload-genome', uploadGenome);

export default router;
