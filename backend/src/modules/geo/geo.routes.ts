import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { checkArrival } from './geo.controller';

const router = Router();

// POST /geo/arrival-check — authenticated customer only
router.post('/arrival-check', authenticate, checkArrival);

export default router;
