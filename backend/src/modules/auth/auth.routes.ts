import { Router } from 'express';
import { authLimiter } from '../../middleware/rate-limit.middleware';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import {
  signupController,
  verifyOtpController,
  loginController,
  logoutController,
  refreshController,
  forgotPasswordController,
  resetPasswordController,
  checkEmailController,
} from './auth.controller';
import {
  signupSchema,
  loginSchema,
  otpSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  refreshTokenSchema,
} from './auth.schema';

const router = Router();

// All auth routes share the authLimiter
router.use(authLimiter);

router.post('/signup', validate(signupSchema), signupController);
router.post('/verify-otp', validate(otpSchema), verifyOtpController);
router.post('/login', validate(loginSchema), loginController);
router.post('/logout', authenticate, logoutController);
router.post('/refresh', validate(refreshTokenSchema), refreshController);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPasswordController);
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordController);
router.get('/check-email', checkEmailController);

export default router;
