import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { injectTenant } from '../../middleware/tenant.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateBrandingSchema, uploadUrlSchema } from './branding.schema';
import * as ctrl from './branding.controller';

const router = Router({ mergeParams: true }); // inherits :id from parent router

// Public — customer app loads branding on every launch
router.get('/', ctrl.getBranding);

// Owner only — edit branding
router.patch(
  '/',
  authenticate,
  injectTenant,
  requireRole('owner'),
  validate(updateBrandingSchema),
  ctrl.updateBranding
);

// Owner only — get presigned upload URL for logo/banner
router.post(
  '/upload-url',
  authenticate,
  injectTenant,
  requireRole('owner'),
  validate(uploadUrlSchema),
  ctrl.getUploadUrl
);

export default router;
