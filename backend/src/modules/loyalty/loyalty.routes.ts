import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import {
  getBalance,
  earnPoints,
  redeemPoints,
  getHistory,
} from './loyalty.controller';

const router: import('express').Router = Router();

router.use(authenticate);

// GET /loyalty/balance — returns balance for the authenticated user (own data only)
router.get('/balance', getBalance);

// POST /loyalty/earn
router.post('/earn', earnPoints);

// POST /loyalty/redeem
router.post('/redeem', redeemPoints);

// GET /loyalty/history — returns transaction history for authenticated user only
router.get('/history', getHistory);

export default router;
