import { Request, Response, NextFunction } from 'express';
import { success } from '../../utils/response';
import {
  assignDelivery,
  getDelivery,
  updateDeliveryStatus,
  updatePartnerLocation,
  getActiveDelivery,
  getPartnerEarnings,
} from './delivery.service';

export async function handleAssignDelivery(req: Request, res: Response, next: NextFunction) {
  try {
    const delivery = await assignDelivery(
      req.params.orderId,
      req.branchId!,
      req.restaurantId!
    );
    res.status(201).json(success(delivery, 'Delivery assigned'));
  } catch (err) {
    next(err);
  }
}

export async function handleGetDelivery(req: Request, res: Response, next: NextFunction) {
  try {
    const delivery = await getDelivery(req.params.id, req.user!.id);
    res.json(success(delivery));
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateDeliveryStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const delivery = await updateDeliveryStatus(
      req.params.id,
      req.user!.id,
      req.body.status
    );
    res.json(success(delivery, 'Status updated'));
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await updatePartnerLocation(
      req.user!.id,
      req.body.lat,
      req.body.lon,
      req.body.delivery_id
    );
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function handleGetActiveDelivery(req: Request, res: Response, next: NextFunction) {
  try {
    const delivery = await getActiveDelivery(req.user!.id);
    res.json(success(delivery));
  } catch (err) {
    next(err);
  }
}

export async function handleGetEarnings(req: Request, res: Response, next: NextFunction) {
  try {
    const earnings = await getPartnerEarnings(req.user!.id);
    res.json(success(earnings));
  } catch (err) {
    next(err);
  }
}
