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

// GET /loyalty/balance/:userId
router.get('/balance/:userId', getBalance);

// POST /loyalty/earn
router.post('/earn', earnPoints);

// POST /loyalty/redeem
router.post('/redeem', redeemPoints);

// GET /loyalty/history/:userId
router.get('/history/:userId', getHistory);

export default router;
