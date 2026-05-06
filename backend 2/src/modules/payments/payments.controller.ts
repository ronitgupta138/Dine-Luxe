import { Request, Response, NextFunction } from 'express';
import { success } from '../../utils/response';
import {
  initiatePayment,
  verifyPayment,
  generateUPIQR,
  pollUPIStatus,
  splitBill,
  getReceipt,
  handleGatewayWebhook,
} from './payments.service';

export async function handleInitiatePayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await initiatePayment(req.body, req.branchId!, req.restaurantId!);
    res.status(201).json(success(result, 'Payment initiated'));
  } catch (err) {
    next(err);
  }
}

export async function handleVerifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await verifyPayment(req.body, req.branchId!);
    res.json(success(result, 'Payment verified'));
  } catch (err) {
    next(err);
  }
}

export async function handleGenerateUPIQR(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await generateUPIQR(req.body, req.branchId!);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function handlePollUPIStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pollUPIStatus(req.params.ref, req.branchId!);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function handleSplitBill(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await splitBill(req.body, req.branchId!, req.restaurantId!);
    res.status(201).json(success(result, 'Split created'));
  } catch (err) {
    next(err);
  }
}

export async function handleGetReceipt(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getReceipt(req.params.orderId, req.branchId!);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function handleGatewayWebhookController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // TODO: Pass raw body for signature verification (configure express.raw() on this route)
    const result = await handleGatewayWebhook(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
