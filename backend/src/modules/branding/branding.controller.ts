import { Request, Response, NextFunction } from 'express';
import * as brandingService from './branding.service';
import { success } from '../../utils/response';

// GET /restaurants/:id/branding  (public — customer app calls this on launch)
export async function getBranding(req: Request, res: Response, next: NextFunction) {
  try {
    const branding = await brandingService.getBranding(req.params.id);
    res.json(success(branding));
  } catch (err) {
    next(err);
  }
}

// PATCH /restaurants/:id/branding  (owner only)
export async function updateBranding(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await brandingService.updateBranding(req.params.id, req.body);
    res.json(success(updated, 'Branding updated'));
  } catch (err) {
    next(err);
  }
}

// POST /restaurants/:id/branding/upload-url  (owner only)
export async function getUploadUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await brandingService.getUploadUrl(req.params.id, req.body);
    res.json(success(result, 'Upload URL generated'));
  } catch (err) {
    next(err);
  }
}
