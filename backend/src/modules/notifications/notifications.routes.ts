import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  getNotifications,
  markRead,
  markAllRead,
  registerDevice,
  removeDevice,
} from './notifications.controller';
import { registerDeviceSchema } from './notifications.schema';

const router: import('express').Router = Router();

router.use(authenticate);

// GET /notifications
router.get('/', getNotifications);

// PATCH /notifications/:id/read
router.patch('/:id/read', markRead);

// PATCH /notifications/read-all
router.patch('/read-all', markAllRead);

// POST /notifications/register-device
router.post('/register-device', validate(registerDeviceSchema), registerDevice);

// DELETE /notifications/device/:token
router.delete('/device/:token', removeDevice);

export default router;
