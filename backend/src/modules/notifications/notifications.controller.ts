import { Request, Response, NextFunction } from 'express';
import * as notificationsService from './notifications.service';
import { success } from '../../utils/response';

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await notificationsService.getForUser(req.user!.id, page, limit);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await notificationsService.markRead(req.params.id, req.user!.id);
    res.json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notificationsService.markAllRead(req.user!.id);
    res.json(success({ message: 'All notifications marked as read' }));
  } catch (err) {
    next(err);
  }
}

export async function registerDevice(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, platform } = req.body;
    const data = await notificationsService.registerDevice(req.user!.id, token, platform);
    res.status(201).json(success(data));
  } catch (err) {
    next(err);
  }
}

export async function removeDevice(req: Request, res: Response, next: NextFunction) {
  try {
    await notificationsService.removeDevice(req.user!.id, req.params.token);
    res.json(success({ message: 'Device token removed' }));
  } catch (err) {
    next(err);
  }
}
