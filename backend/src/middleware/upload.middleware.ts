import { Request, Response, NextFunction, RequestHandler } from 'express';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../config/supabase';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ─── Multer: Memory Storage ───────────────────────────────────────────────────

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(
        new Error(`Unsupported file type: ${file.mimetype}. Allowed: jpeg, png, webp`),
        { status: 415 }
      ) as unknown as null,
      false
    );
  }
};

const multerBase = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
});

// ─── Sharp: Resize + Convert to WebP ─────────────────────────────────────────

async function processAndUpload(
  file: Express.Multer.File,
  bucket: string,
  folder: string
): Promise<string> {
  const fileName = `${folder}/${uuidv4()}.webp`;

  // Resize to max 1200px wide, convert to WebP with quality 85
  const webpBuffer = await sharp(file.buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, webpBuffer, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (error) {
    throw Object.assign(new Error(`Storage upload failed: ${error.message}`), { status: 500 });
  }

  const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);
  return urlData.publicUrl;
}

// ─── uploadSingle ─────────────────────────────────────────────────────────────

export function uploadSingle(
  fieldName: string,
  bucket: string,
  folder: string
): RequestHandler[] {
  return [
    multerBase.single(fieldName),

    async (req: Request, _res: Response, next: NextFunction) => {
      if (!req.file) return next();

      try {
        const publicUrl = await processAndUpload(req.file, bucket, folder);
        // Attach URL to request body for downstream controllers
        req.body[`${fieldName}_url`] = publicUrl;
        req.body[`${fieldName}_uploaded`] = {
          url: publicUrl,
          original_name: req.file.originalname,
          size: req.file.size,
          mime_type: req.file.mimetype,
        };
        next();
      } catch (err) {
        next(err);
      }
    },
  ];
}

// ─── uploadMultiple ───────────────────────────────────────────────────────────

export function uploadMultiple(
  fieldName: string,
  maxCount: number,
  bucket: string,
  folder: string
): RequestHandler[] {
  return [
    multerBase.array(fieldName, maxCount),

    async (req: Request, _res: Response, next: NextFunction) => {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) return next();

      try {
        const uploadPromises = files.map((file) => processAndUpload(file, bucket, folder));
        const urls = await Promise.all(uploadPromises);

        req.body[`${fieldName}_urls`] = urls;
        req.body[`${fieldName}_uploaded`] = files.map((file, i) => ({
          url: urls[i],
          original_name: file.originalname,
          size: file.size,
          mime_type: file.mimetype,
        }));

        next();
      } catch (err) {
        next(err);
      }
    },
  ];
}

// ─── Error Handler for Multer ─────────────────────────────────────────────────

export function handleUploadError(
  err: Error,
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(
        Object.assign(new Error(`File too large. Maximum size is ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB`), {
          status: 413,
        })
      );
    }
    return next(Object.assign(new Error(err.message), { status: 400 }));
  }
  next(err);
}
