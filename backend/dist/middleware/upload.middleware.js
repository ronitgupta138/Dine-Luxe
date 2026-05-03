"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingle = uploadSingle;
exports.uploadMultiple = uploadMultiple;
exports.handleUploadError = handleUploadError;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const supabase_1 = require("../config/supabase");
// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// ─── Multer: Memory Storage ───────────────────────────────────────────────────
const storage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(Object.assign(new Error(`Unsupported file type: ${file.mimetype}. Allowed: jpeg, png, webp`), { status: 415 }), false);
    }
};
const multerBase = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
});
// ─── Sharp: Resize + Convert to WebP ─────────────────────────────────────────
async function processAndUpload(file, bucket, folder) {
    const fileName = `${folder}/${(0, uuid_1.v4)()}.webp`;
    // Resize to max 1200px wide, convert to WebP with quality 85
    const webpBuffer = await (0, sharp_1.default)(file.buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    const { error } = await supabase_1.supabaseAdmin.storage
        .from(bucket)
        .upload(fileName, webpBuffer, {
        contentType: 'image/webp',
        upsert: false,
    });
    if (error) {
        throw Object.assign(new Error(`Storage upload failed: ${error.message}`), { status: 500 });
    }
    const { data: urlData } = supabase_1.supabaseAdmin.storage.from(bucket).getPublicUrl(fileName);
    return urlData.publicUrl;
}
// ─── uploadSingle ─────────────────────────────────────────────────────────────
function uploadSingle(fieldName, bucket, folder) {
    return [
        multerBase.single(fieldName),
        async (req, _res, next) => {
            if (!req.file)
                return next();
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
            }
            catch (err) {
                next(err);
            }
        },
    ];
}
// ─── uploadMultiple ───────────────────────────────────────────────────────────
function uploadMultiple(fieldName, maxCount, bucket, folder) {
    return [
        multerBase.array(fieldName, maxCount),
        async (req, _res, next) => {
            const files = req.files;
            if (!files || files.length === 0)
                return next();
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
            }
            catch (err) {
                next(err);
            }
        },
    ];
}
// ─── Error Handler for Multer ─────────────────────────────────────────────────
function handleUploadError(err, _req, _res, next) {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(Object.assign(new Error(`File too large. Maximum size is ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB`), {
                status: 413,
            }));
        }
        return next(Object.assign(new Error(err.message), { status: 400 }));
    }
    next(err);
}
//# sourceMappingURL=upload.middleware.js.map