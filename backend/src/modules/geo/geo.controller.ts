import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { success, error } from '../../utils/response';
import { arrivalCheck } from './geo.service';

const arrivalCheckSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  bookingId: z.string().uuid(),
});

export async function checkArrival(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = arrivalCheckSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(error('VALIDATION_ERROR', 'Validation failed'));
    }
    const data = await arrivalCheck(parsed.data, req.user!.id);
    res.json(success(data));
  } catch (err: any) {
    if (err.statusCode) return res.status(err.statusCode).json(error('GEO_ERROR', err.message));
    next(err);
  }
}
