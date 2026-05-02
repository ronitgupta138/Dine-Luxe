import { Request, Response, NextFunction } from 'express';
import * as restaurantsService from './restaurants.service';
import { success, error } from '../../utils/response';

type AuthenticatedRequest = Request & {
  user: { id: string; branch_id?: string; role: string; restaurant_id?: string };
  restaurantId: string;
  branchId: string;
};

// POST /restaurants/register  (public — owner onboarding)
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const ip = req.ip ?? 'unknown';
    const result = await restaurantsService.register(req.body, ip);
    res.status(201).json(success(result, 'Restaurant registered — pending approval'));
  } catch (err) {
    next(err);
  }
}

// GET /restaurants  (admin only)
export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as string | undefined;
    const result = await restaurantsService.getAll(page, limit, status);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

// GET /restaurants/nearby?lat=&lon=&radius=  (public)
export async function getNearby(req: Request, res: Response, next: NextFunction) {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const radius = parseFloat(req.query.radius as string) || 10;

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json(error('VALIDATION_ERROR', 'lat and lon are required'));
    }

    const restaurants = await restaurantsService.getNearby(lat, lon, radius);
    res.json(success(restaurants));
  } catch (err) {
    next(err);
  }
}

// GET /restaurants/:id  (public)
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const restaurant = await restaurantsService.getById(req.params.id);
    res.json(success(restaurant));
  } catch (err) {
    next(err);
  }
}

// GET /restaurants/:id/live-status  (public)
export async function getLiveStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const status = await restaurantsService.getLiveStatus(req.params.id);
    res.json(success(status));
  } catch (err) {
    next(err);
  }
}

// PATCH /restaurants/:id  (owner only)
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await restaurantsService.update(req.params.id, req.body);
    res.json(success(updated, 'Restaurant updated'));
  } catch (err) {
    next(err);
  }
}

// PATCH /restaurants/:id/status  (admin only)
export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const updated = await restaurantsService.updateStatus(
      req.params.id,
      req.body,
      authReq.user!.id,
      req.ip ?? 'unknown'
    );
    res.json(success(updated, 'Status updated'));
  } catch (err) {
    next(err);
  }
}
