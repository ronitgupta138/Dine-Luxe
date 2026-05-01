import { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service';
import { success, error } from '../../utils/response';

// GET /users/me
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await usersService.getMe(req.user.id);
    res.json(success(profile, 'Profile fetched'));
  } catch (err) {
    next(err);
  }
}

// PATCH /users/me
export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await usersService.updateMe(req.user.id, req.body);
    res.json(success(updated, 'Profile updated'));
  } catch (err) {
    next(err);
  }
}

// GET /users/:id  (manager/owner/admin)
export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getUserById(req.params.id, req.restaurantId);
    res.json(success(user, 'User fetched'));
  } catch (err) {
    next(err);
  }
}

// GET /users/check-email?email=
export async function checkEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const email = req.query.email as string;
    if (!email) return res.status(400).json(error('Email query param required'));
    const result = await usersService.checkEmail(email);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}
