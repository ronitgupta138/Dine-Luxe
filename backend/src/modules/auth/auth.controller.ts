import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { success, error } from '../../utils/response';

export async function signupController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.signup(req.body);
    res.status(202).json(success(result, 'OTP sent. Please verify your email.'));
  } catch (err) {
    next(err);
  }
}

export async function verifyOtpController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.verifyOtp(req.body);
    res.status(201).json(success(result, 'Account verified and created successfully.'));
  } catch (err) {
    next(err);
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(success(result, 'Login successful.'));
  } catch (err) {
    next(err);
  }
}

export async function logoutController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    await authService.logout(userId ?? '');
    res.status(200).json(success(null, 'Logged out successfully.'));
  } catch (err) {
    next(err);
  }
}

export async function refreshController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.refreshToken(req.body);
    res.status(200).json(success(result, 'Token refreshed.'));
  } catch (err) {
    next(err);
  }
}

export async function forgotPasswordController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.forgotPassword(req.body);
    res.status(200).json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.resetPassword(req.body);
    res.status(200).json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function checkEmailController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // BUG FIX: normalise email before querying so "User@Email.Com" and
    // "user@email.com" are treated as the same address.
    const raw = req.query['email'] as string;
    const email = (raw ?? '').toLowerCase().trim();
    if (!email) {
      res.status(400).json(error('VALIDATION_ERROR', 'email query parameter is required'));
      return;
    }
    const { data, error: dbError } = await import('../../config/supabase').then(({ supabaseAdmin }) =>
      supabaseAdmin.from('users').select('id').eq('email', email).maybeSingle(),
    );
    if (dbError) throw dbError;
    res.status(200).json(success({ available: !data }, data ? 'Email is taken.' : 'Email is available.'));
  } catch (err) {
    next(err);
  }
}
